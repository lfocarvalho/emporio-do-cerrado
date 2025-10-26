# -*- coding: utf-8 *-
from django.contrib.auth import authenticate, login, logout
from django.views.generic import View
from django.shortcuts import render, redirect
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import TemplateView
from django.views.generic.edit import CreateView
from django.urls import reverse_lazy
from .forms import CustomUserCreationForm

class Login(View):
    """
    Class Based View para autenticação de usuários.
    """

    def get(self,request):
        contexto = {}
        if request.user.is_authenticated:
            return redirect("/produtos/")
        else:
            return render(request, 'autenticacao.html', contexto)
    
    def post(self,request):
        # Obtem as credenciais de autenticação
        usuario = request.POST.get('usuario', None)
        senha = request.POST.get('senha', None)

        user = authenticate(request, username=usuario, password=senha)
        if user is not None:
            if user.is_active:
                login(request, user)
                return redirect("/produtos")
        else:
            return render(request, 'autenticacao.html', {'mensagem': 'Usuário ou senha inválidos!'})

class Logout(View):
    """
    Class Based View para fazer logout do usuário.
    """
    def get(self, request):
        logout(request)
        return redirect('/')
    
class LoginAPI(ObtainAuthToken):

    def post (self,request, *args, **kwargs):
        serializer = self.serializer_class(
            
        data=request.data, 
         context={
             'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'id' :user.id,
            'nome' : user.first_name,
            'email' : user.email,
            'token' : token.key,
          
        })
    
class PerfilView(LoginRequiredMixin, TemplateView):
    """
    View para exibir a página de perfil do usuário logado.
    """
    template_name = 'perfil.html'
    
class CadastroView(CreateView):
    """
    View para a página de cadastro de novos usuários.
    """
    form_class = CustomUserCreationForm
    template_name = "cadastro.html"
    # Redireciona para a página de login após o sucesso
    success_url = reverse_lazy('login')