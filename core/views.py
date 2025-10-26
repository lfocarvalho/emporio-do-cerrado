# core/views.py
from django.urls import reverse_lazy
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import UserPassesTestMixin
from .models import Carrossel

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