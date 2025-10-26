# pedido/models.py
from django.db import models
from django.contrib.auth.models import User
from produto.models import Produto

class Pedido(models.Model):
    STATUS_CHOICES = (
        ('carrinho', 'Carrinho'),
        ('realizado', 'Realizado'),
        ('entregue', 'Entregue'),
    )
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='carrinho')
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pedido {self.id} de {self.usuario.username}"

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1)
    preco = models.DecimalField(max_digits=10, decimal_places=2) # Preço no momento da compra

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"