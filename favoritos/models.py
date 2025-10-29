# favoritos/models.py
from django.db import models
from django.contrib.auth.models import User
from produto.models import Produto

class Favorito(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Garante que um usuário não pode favoritar o mesmo produto duas vezes
        unique_together = ('usuario', 'produto')

    def __str__(self):
        return f"{self.usuario.username} favoritou {self.produto.nome}"