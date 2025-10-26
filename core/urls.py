# core/urls.py
from django.urls import path
from .views import GerenciarCarrosselView, CriarCarrosselView, EditarCarrosselView, DeletarCarrosselView

app_name = 'core'

urlpatterns = [
    path('gerenciar/carrossel/', GerenciarCarrosselView.as_view(), name='gerenciar-carrossel'),
    path('gerenciar/carrossel/novo/', CriarCarrosselView.as_view(), name='criar-carrossel'),
    path('gerenciar/carrossel/editar/<int:pk>/', EditarCarrosselView.as_view(), name='editar-carrossel'),
    path('gerenciar/carrossel/deletar/<int:pk>/', DeletarCarrosselView.as_view(), name='deletar-carrossel'),
]