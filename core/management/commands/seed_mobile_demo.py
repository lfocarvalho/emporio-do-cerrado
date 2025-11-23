from django.core.management.base import BaseCommand
from django.conf import settings
from pathlib import Path
from PIL import Image

from core.models import Carrossel
from produto.models import Categoria, Produto


class Command(BaseCommand):
    help = "Cria dados de demonstração para o app mobile (carrossel, categorias e produtos)."

    def handle(self, *args, **options):
        base_media: Path = Path(settings.MEDIA_ROOT)
        base_media.mkdir(parents=True, exist_ok=True)

        # 1) Carrossel (gera uma imagem simples 800x400)
        carrossel_dir = base_media / 'carrossel_imagens'
        carrossel_dir.mkdir(parents=True, exist_ok=True)
        demo_img_path = carrossel_dir / 'demo_slide.png'
        if not demo_img_path.exists():
            img = Image.new('RGB', (800, 400), color=(25, 130, 88))  # verde
            img.save(demo_img_path)
            self.stdout.write(self.style.SUCCESS(f"Imagem de carrossel criada: {demo_img_path}"))
        Carrossel.objects.get_or_create(
            titulo='Bem-vindo ao Empório do Cerrado',
            imagem=f'carrossel_imagens/{demo_img_path.name}',
            defaults={
                'ativo': True,
                'ordem': 0,
                'link_destino': ''
            }
        )

        # 2) Categorias
        cat_bebidas, _ = Categoria.objects.get_or_create(nome='Bebidas')
        cat_artesanais, _ = Categoria.objects.get_or_create(nome='Artesanais')

        # 3) Produtos (sem imagem para simplicidade)
        Produto.objects.get_or_create(
            nome='Café do Cerrado 250g',
            defaults={
                'descricao': 'Café especial do Cerrado, torra média',
                'preco': '19.90',
                'estoque': 25,
                'categoria': cat_bebidas,
            }
        )
        Produto.objects.get_or_create(
            nome='Doce de Leite Artesanal 400g',
            defaults={
                'descricao': 'Produção local, sabor tradicional',
                'preco': '24.50',
                'estoque': 15,
                'categoria': cat_artesanais,
            }
        )

        self.stdout.write(self.style.SUCCESS('Dados de demonstração criados/atualizados com sucesso.'))
