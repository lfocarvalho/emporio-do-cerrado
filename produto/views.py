# mercado/produto/views.py

from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.contrib.auth.mixins import UserPassesTestMixin
from django.db.models import Q
from django.http import Http404

from rest_framework.generics import ListAPIView
from rest_framework.authentication import TokenAuthentication
from rest_framework import permissions

# Importe o modelo Carrossel do app core
from core.models import Carrossel
from .forms import FormularioProduto
from .serializers import SerializadorProduto
from .models import Produto, Categoria

class HomeView(ListView):
    """
    View para a página inicial, mostrando categorias e produtos em destaque.
    """
    model = Produto
    template_name = 'home.html'
    context_object_name = 'produtos'

    def get_queryset(self):
        # Retorna os 8 produtos mais recentes QUE TÊM IMAGEM
        return Produto.objects.filter(imagem__isnull=False).exclude(imagem='').order_by('-id')[:8]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categorias'] = Categoria.objects.all()[:6]
        # Busca os slides ativos QUE TÊM IMAGEM
        context['slides_carrossel'] = Carrossel.objects.filter(
            ativo=True, 
            imagem__isnull=False
        ).exclude(imagem='').order_by('ordem')
        return context

# --- O RESTO DO FICHEIRO CONTINUA IGUAL ---

class ListarProdutos(ListView):
    model = Produto
    context_object_name = 'lista_produtos'
    template_name = 'produto/listar.html'

    def get_queryset(self):
        queryset = super().get_queryset().order_by('nome')
        categoria_query = self.request.GET.get('categoria')
        if categoria_query:
            queryset = queryset.filter(categoria__nome=categoria_query)
        
        busca = self.request.GET.get('busca')
        if busca:
            queryset = queryset.filter(
                Q(nome__icontains=busca) | Q(descricao__icontains=busca)
            )
        return queryset

class DetalheProduto(DetailView):
    model = Produto
    template_name = 'produto/detalhe.html'
    context_object_name = 'produto'

class GerenciarEstoqueView(UserPassesTestMixin, ListView):
    model = Produto
    template_name = 'produto/gerenciar_estoque.html'
    context_object_name = 'produtos'
    ordering = ['-id']

    def test_func(self):
        return self.request.user.is_staff

class CriarProduto(UserPassesTestMixin, CreateView):
    model = Produto
    form_class = FormularioProduto
    template_name = 'produto/novo.html'
    success_url = reverse_lazy('produtos:gerenciar-estoque')

    def test_func(self):
        return self.request.user.is_staff

class EditarProduto(UserPassesTestMixin, UpdateView):
    model = Produto
    form_class = FormularioProduto
    template_name = 'produto/editar.html'
    success_url = reverse_lazy('produtos:gerenciar-estoque')

    def test_func(self):
        return self.request.user.is_staff

class ExcluirProduto(UserPassesTestMixin, DeleteView):
    model = Produto
    template_name = 'produto/excluir.html'
    success_url = reverse_lazy('produtos:gerenciar-estoque')

    def test_func(self):
        return self.request.user.is_staff

class APIListarProdutos(ListAPIView):
    serializer_class = SerializadorProduto
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Produto.objects.all()