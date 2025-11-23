# core/views.py
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import UserPassesTestMixin
from .models import Carrossel

# DRF
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.authentication import TokenAuthentication

class GerenciarCarrosselView(UserPassesTestMixin, ListView):
    model = Carrossel
    template_name = 'core/gerenciar_carrossel.html'
    context_object_name = 'itens_carrossel'

    def test_func(self):
        return self.request.user.is_staff

class CriarCarrosselView(UserPassesTestMixin, CreateView):
    model = Carrossel
    fields = ['titulo', 'imagem', 'link_destino', 'ativo', 'ordem']
    template_name = 'core/carrossel_form.html'
    success_url = reverse_lazy('core:gerenciar-carrossel')

    def test_func(self):
        return self.request.user.is_staff

class EditarCarrosselView(UserPassesTestMixin, UpdateView):
    model = Carrossel
    fields = ['titulo', 'imagem', 'link_destino', 'ativo', 'ordem']
    template_name = 'core/carrossel_form.html'
    success_url = reverse_lazy('core:gerenciar-carrossel')

    def test_func(self):
        return self.request.user.is_staff

class DeletarCarrosselView(UserPassesTestMixin, DeleteView):
    model = Carrossel
    template_name = 'core/carrossel_confirm_delete.html'
    success_url = reverse_lazy('core:gerenciar-carrossel')

    def test_func(self):
        return self.request.user.is_staff


class APIListarCarrossel(APIView):
    """Lista apenas itens ativos do carrossel na ordem definida."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        qs = Carrossel.objects.filter(ativo=True, imagem__isnull=False).exclude(imagem='').order_by('ordem')
        data = [
            {
                'id': c.id,
                'titulo': c.titulo,
                'imagem': c.imagem.url if c.imagem else None,
                'link_destino': c.link_destino,
                'ordem': c.ordem,
            }
            for c in qs
        ]
        return Response(data)