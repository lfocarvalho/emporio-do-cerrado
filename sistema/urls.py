"""
URL configuration for sistema project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
# 1. Importações necessárias para servir ficheiros de média
from django.conf import settings
from django.conf.urls.static import static
from sistema.views import Login, Logout, LoginAPI, PerfilView, CadastroView
from produto.views import HomeView

urlpatterns = [
    path('', HomeView.as_view(), name='home'),
    path('login/', Login.as_view(), name='login'),
    path('logout/', Logout.as_view(), name='logout'),
    path('perfil/', PerfilView.as_view(), name='perfil'),
    path('cadastro/', CadastroView.as_view(), name='cadastro'),
    
    path('admin/', admin.site.urls),
    path('produtos/', include('produto.urls')),
    path('pedidos/', include('pedido.urls')),
    path('', include('core.urls')),
    path('autenticacao-api/', LoginAPI.as_view())
]

# 2. Adicione este bloco de código ao final do ficheiro
# Esta é a configuração que diz ao Django como encontrar as suas imagens
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)