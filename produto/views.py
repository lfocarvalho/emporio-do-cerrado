# mercado/produto/views.py

from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.contrib.auth.mixins import UserPassesTestMixin
from django.db.models import Q
from django.http import Http404

from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.authentication import TokenAuthentication
from rest_framework import permissions

from core.models import Carrossel
from favoritos.models import Favorito
from .forms import FormularioProduto
from .serializers import SerializadorProduto, SerializadorCategoria
from .models import Produto, Categoria

class HomeView(ListView):
    model = Produto
    template_name = 'home.html'
    context_object_name = 'produtos'

    def get_queryset(self):
        return Produto.objects.filter(imagem__isnull=False).exclude(imagem='').order_by('-id')[:8]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Flag para controlar exibição do carrossel
        mostrar_carrossel = True
        if self.request.GET.get('hide_carrossel') == '1':
            mostrar_carrossel = False
        if self.request.GET.get('mostrar_carrossel') == '0':
            mostrar_carrossel = False

        context['mostrar_carrossel'] = mostrar_carrossel
        context['categorias'] = Categoria.objects.all()[:6]

        if mostrar_carrossel:
            context['slides_carrossel'] = Carrossel.objects.filter(
                ativo=True,
                imagem__isnull=False
            ).exclude(imagem='').order_by('ordem')
        else:
            context['slides_carrossel'] = []
        
        if self.request.user.is_authenticated:
            favoritos = Favorito.objects.filter(usuario=self.request.user)
            context['favoritos_ids'] = list(favoritos.values_list('produto_id', flat=True))
        else:
            context['favoritos_ids'] = []
            
        return context

class ListarProdutos(ListView):
    model = Produto
    context_object_name = 'lista_produtos'
    template_name = 'produto/listar.html'
    paginate_by = 20

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

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categorias'] = Categoria.objects.all().order_by('nome')
        context['categoria_selecionada'] = self.request.GET.get('categoria')
        
        if self.request.user.is_authenticated:
            favoritos = Favorito.objects.filter(usuario=self.request.user)
            context['favoritos_ids'] = list(favoritos.values_list('produto_id', flat=True))
        else:
            context['favoritos_ids'] = []
            
        return context

# --- VIEW ATUALIZADA ---
class DetalheProduto(DetailView):
    model = Produto
    template_name = 'produto/detalhe.html'
    context_object_name = 'produto'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        produto_atual = self.get_object()

        # Lógica para buscar produtos relacionados
        if produto_atual.categoria:
            context['produtos_relacionados'] = Produto.objects.filter(
                categoria=produto_atual.categoria
            ).exclude(pk=produto_atual.pk)[:4] # Pega até 4 produtos da mesma categoria, excluindo o atual
        
        # Mantém a lógica de favoritos
        if self.request.user.is_authenticated:
            favoritos = Favorito.objects.filter(usuario=self.request.user)
            context['favoritos_ids'] = list(favoritos.values_list('produto_id', flat=True))
        else:
            context['favoritos_ids'] = []
            
        return context

# --- O RESTO DO FICHEIRO CONTINUA IGUAL ---

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
    # Tornar listagem pública (somente leitura) para app mobile exibir produtos sem login
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Produto.objects.all().order_by('nome')
        categoria_query = self.request.GET.get('categoria')
        if categoria_query:
            # Mesmo comportamento da listagem web: filtra por nome da categoria
            qs = qs.filter(categoria__nome=categoria_query)

        busca = self.request.GET.get('busca')
        if busca:
            qs = qs.filter(Q(nome__icontains=busca) | Q(descricao__icontains=busca))
        return qs


class APICategorias(ListAPIView):
    serializer_class = SerializadorCategoria
    # Categorias públicas para navegação inicial no app
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Categoria.objects.all().order_by('nome')


class APIDetalheProduto(RetrieveAPIView):
    serializer_class = SerializadorProduto
    # Detalhe também público (somente GET) para facilitar compartilhamento
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    queryset = Produto.objects.all()