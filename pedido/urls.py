# pedido/urls.py
from django.urls import path
from .views import adicionar_ao_carrinho, ver_carrinho, remover_do_carrinho, finalizar_pedido, historico_pedidos ,adicionar_item_carrinho, subtrair_item_carrinho

app_name = 'pedido'

urlpatterns = [
    path('carrinho/', ver_carrinho, name='ver_carrinho'),
    path('adicionar/<int:produto_id>/', adicionar_ao_carrinho, name='adicionar_ao_carrinho'),
    path('remover/<int:item_id>/', remover_do_carrinho, name='remover_do_carrinho'),
    path('finalizar/', finalizar_pedido, name='finalizar_pedido'),
    path('historico/', historico_pedidos, name='historico_pedidos'),
    path('carrinho/adicionar/<int:item_id>/', adicionar_item_carrinho, name='adicionar_item_carrinho'),
    path('carrinho/subtrair/<int:item_id>/', subtrair_item_carrinho, name='subtrair_item_carrinho'),
]