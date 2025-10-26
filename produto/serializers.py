# produto/serializers.py
from rest_framework import serializers
from .models import Produto

class SerializadorProduto(serializers.ModelSerializer):
    class Meta:
        model = Produto
        exclude = []