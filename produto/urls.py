# mercado/produto/urls.py
from django.urls import path
from .views import (
    ListarProdutos,
    CriarProduto,
    EditarProduto,
    ExcluirProduto,
    APIListarProdutos,
    DetalheProduto,
    GerenciarEstoqueView # Importa a nova view
)

app_name = 'produtos'

urlpatterns = [
    # Rotas públicas
    path('', ListarProdutos.as_view(), name='listar-produtos'),
    path('<int:pk>/', DetalheProduto.as_view(), name='detalhe-produto'),

    # --- ROTAS DE GERENCIAMENTO (PROTEGIDAS) ---
    path('gerenciar/estoque/', GerenciarEstoqueView.as_view(), name='gerenciar-estoque'),
    path('gerenciar/novo/', CriarProduto.as_view(), name='criar-produto'),
    path('gerenciar/editar/<int:pk>/', EditarProduto.as_view(), name='editar-produto'),
    path('gerenciar/excluir/<int:pk>/', ExcluirProduto.as_view(), name='excluir-produto'),
    
    # Rota da API
    path('api/', APIListarProdutos.as_view(), name='api-listar-produtos'),
]