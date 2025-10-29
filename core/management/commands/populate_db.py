# mercado/core/management/commands/populate_db.py

import random
import requests
from io import BytesIO
from urllib.parse import quote

from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from produto.models import Categoria, Produto

# (As listas de produtos e categorias continuam as mesmas)
CATEGORIAS = [
    "Frutas", "Verduras e Legumes", "Padaria", "Açougue e Peixaria",
    "Frios e Laticínios", "Bebidas", "Higiene e Limpeza", "Mercearia",
]

PRODUTOS = {
    "Frutas": [
        ("Maçã Gala", "Maçã fresca e crocante.", 2.50), ("Banana Prata", "Banana madura, ideal para vitaminas.", 1.80),
        ("Uva Thompson", "Uvas sem sementes, doces e suculentas.", 8.99), ("Morango", "Bandeja de morangos frescos.", 7.50),
        ("Laranja Pera", "Laranja ideal para sucos.", 3.20),
    ],
    "Verduras e Legumes": [
        ("Alface Crespa", "Alface fresca para saladas.", 3.00), ("Tomate Italiano", "Tomate maduro, perfeito para molhos.", 5.50),
        ("Batata Inglesa", "Batata versátil para diversas receitas.", 4.00), ("Cenoura", "Cenoura fresca e rica em vitaminas.", 3.50),
        ("Brócolis", "Brócolis fresco e nutritivo.", 6.00),
    ],
    "Padaria": [
        ("Pão Francês", "Pão fresco, assado na hora.", 0.75), ("Bolo de Chocolate", "Fatia de bolo de chocolate fofinho.", 6.50),
        ("Pão de Queijo", "Porção de pão de queijo quentinho.", 5.00), ("Croissant", "Croissant de manteiga folhado.", 4.50),
    ],
    "Açougue e Peixaria": [
        ("Patinho Moído", "Carne moída de primeira.", 25.00), ("Filé de Frango", "Filé de frango sem osso e sem pele.", 18.90),
        ("Salmão Fresco", "Posta de salmão fresco do Chile.", 79.90), ("Linguiça Toscana", "Linguiça de porco para churrasco.", 22.00),
    ],
    "Frios e Laticínios": [
        ("Queijo Mussarela", "Queijo mussarela fatiado.", 12.00), ("Presunto Cozido", "Presunto cozido fatiado.", 10.50),
        ("Leite Integral", "Leite longa vida integral.", 4.80), ("Iogurte Natural", "Copo de iogurte natural sem açúcar.", 3.50),
        ("Manteiga com Sal", "Pote de manteiga de primeira qualidade.", 9.00),
    ],
    "Bebidas": [
        ("Refrigerante Cola 2L", "Refrigerante sabor cola.", 8.00), ("Água Mineral 1.5L", "Água mineral sem gás.", 2.50),
        ("Suco de Laranja 1L", "Suco de laranja 100% natural.", 9.50), ("Cerveja Pilsen Lata", "Lata de cerveja pilsen.", 3.80),
    ],
    "Higiene e Limpeza": [
        ("Sabonete", "Sabonete em barra.", 2.20), ("Papel Higiênico", "Pacote com 4 rolos de folha dupla.", 6.80),
        ("Detergente Líquido", "Detergente para louças.", 3.10), ("Água Sanitária 1L", "Água sanitária para limpeza pesada.", 4.50),
    ],
    "Mercearia": [
        ("Arroz Branco 5kg", "Arroz tipo 1.", 28.00), ("Feijão Carioca 1kg", "Feijão carioca tipo 1.", 9.50),
        ("Óleo de Soja", "Óleo de soja 900ml.", 7.80), ("Açúcar Refinado 1kg", "Açúcar refinado.", 5.20),
        ("Café em Pó 500g", "Café torrado e moído.", 15.00),
    ],
}

def get_image_from_url(search_terms):
    """Tenta baixar uma imagem do Unsplash com base em uma lista de termos de busca."""
    for term in search_terms:
        try:
            encoded_term = quote(term)
            url = f"https://source.unsplash.com/400x400/?{encoded_term}"
            response = requests.get(url, timeout=15) # Aumentado o tempo de espera
            
            # Verifica se a resposta foi bem-sucedida e se é uma imagem
            if response.status_code == 200 and 'image' in response.headers.get('Content-Type', ''):
                return ContentFile(response.content)
        except requests.exceptions.RequestException:
            # Continua para o próximo termo se houver um erro de rede
            continue
    return None

class Command(BaseCommand):
    help = 'Popula o banco de dados com dados de mercado, baixando imagens relevantes automaticamente.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Iniciando o processo de popular o banco de dados...'))

        self.stdout.write(self.style.WARNING('Limpando produtos e categorias existentes...'))
        Produto.objects.all().delete()
        Categoria.objects.all().delete()

        for nome_categoria in CATEGORIAS:
            Categoria.objects.create(nome=nome_categoria)
        self.stdout.write(self.style.SUCCESS('Categorias criadas. Populando produtos...'))

        for nome_categoria, lista_produtos in PRODUTOS.items():
            self.stdout.write(f'Adicionando produtos para a categoria "{nome_categoria}"...')
            categoria_obj = Categoria.objects.get(nome=nome_categoria)
            
            for nome_produto, descricao, preco in lista_produtos:
                produto = Produto.objects.create(
                    nome=nome_produto,
                    descricao=descricao,
                    preco=preco,
                    estoque=random.randint(20, 150),
                    categoria=categoria_obj
                )

                # Define os termos de busca: o mais específico primeiro, depois o mais genérico
                search_terms = [nome_produto.split(' ')[0], categoria_obj.nome]
                
                self.stdout.write(f'  - Buscando imagem para "{nome_produto}" (termos: {search_terms})...', ending='')
                image_content = get_image_from_url(search_terms)
                
                if image_content:
                    file_name = f'{produto.id}_{search_terms[0].lower()}.jpg'
                    produto.imagem.save(file_name, image_content, save=True)
                    self.stdout.write(self.style.SUCCESS(' Imagem encontrada e salva.'))
                else:
                    self.stdout.write(self.style.WARNING(' Nenhuma imagem encontrada.'))
        
        self.stdout.write(self.style.SUCCESS('\nBanco de dados populado com sucesso!'))