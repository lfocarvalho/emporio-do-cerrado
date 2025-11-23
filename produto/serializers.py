# produto/serializers.py
from rest_framework import serializers
from .models import Produto, Categoria

class SerializadorProduto(serializers.ModelSerializer):
    class Meta:
        model = Produto
        exclude = []


class SerializadorCategoria(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome']