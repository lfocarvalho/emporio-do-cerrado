# core/models.py
from django.db import models

class Carrossel(models.Model):
    # Alteração: O título agora é opcional com blank=True e null=True
    titulo = models.CharField(max_length=100, blank=True, null=True, help_text="Título que aparece sobre a imagem (opcional).")
    imagem = models.ImageField(upload_to='carrossel_imagens/')
    link_destino = models.URLField(max_length=200, blank=True, null=True, help_text="Link para onde o usuário será redirecionado ao clicar (opcional).")
    ativo = models.BooleanField(default=True, help_text="Marque para exibir este item no carrossel.")
    ordem = models.PositiveIntegerField(default=0, help_text="Número para ordenar os slides (menores primeiro).")

    class Meta:
        ordering = ['ordem']
        verbose_name = "Item do Carrossel"
        verbose_name_plural = "Itens do Carrossel"

    def __str__(self):
        # Se não houver título, mostra um nome genérico para o slide
        return self.titulo or f"Slide {self.id}"