from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from produto.models import Categoria, Produto
from decimal import Decimal


class Command(BaseCommand):
    help = "Cria categorias e produtos de demonstração para teste do app mobile."

    def handle(self, *args, **options):
        # Categorias demo
        categorias_info = [
            ("Cafés", "cafe"),
            ("Doces", "doces"),
            ("Artesanato", "artesanato"),
        ]
        categorias = []
        for nome, slug in categorias_info:
            cat, _ = Categoria.objects.get_or_create(nome=nome)
            categorias.append(cat)
        self.stdout.write(self.style.SUCCESS(f"Categorias criadas/atualizadas: {', '.join(c.nome for c in categorias)}"))

        # Produtos demo
        produtos_info = [
            ("Café Torrado Premium", Decimal("29.90")),
            ("Doce de Leite Artesanal", Decimal("18.50")),
            ("Escultura em Madeira", Decimal("120.00")),
        ]
        for i, (nome, preco) in enumerate(produtos_info):
            cat = categorias[i % len(categorias)]
            prod, created = Produto.objects.get_or_create(
                nome=nome,
                defaults={
                    'preco': preco,
                    'categoria': cat,
                }
            )
            if not created:
                prod.preco = preco
                prod.categoria = cat
                prod.save()
        self.stdout.write(self.style.SUCCESS("Produtos criados/atualizados."))
        self.stdout.write("Pronto. Faça login pelo app e a Home deve mostrar categorias e produtos.")