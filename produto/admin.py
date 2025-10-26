# mercado/produto/admin.py

from django.contrib import admin
from .models import Produto, Categoria

# Personalização da interface de Categoria
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome',)
    search_fields = ('nome',)

# Personalização da interface de Produto
class ProdutoAdmin(admin.ModelAdmin):
    # Melhora a visualização da lista de produtos no admin
    list_display = ('nome', 'categoria', 'preco', 'estoque')
    # Adiciona um filtro por categoria na lateral
    list_filter = ('categoria',)
    search_fields = ('nome', 'descricao')

# Registra os modelos usando as classes de personalização
admin.site.register(Produto, ProdutoAdmin)
admin.site.register(Categoria, CategoriaAdmin)