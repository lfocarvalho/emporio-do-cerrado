# favoritos/urls.py
from django.urls import path
from .views import toggle_favorito, listar_favoritos, APIToggleFavorito, APIListarFavoritos

app_name = 'favoritos'

urlpatterns = [
    path('', listar_favoritos, name='listar-favoritos'),
    path('toggle/<int:produto_id>/', toggle_favorito, name='toggle-favorito'),
    # API DRF
    path('api/', APIListarFavoritos.as_view(), name='api-listar-favoritos'),
    path('api/toggle/', APIToggleFavorito.as_view(), name='api-toggle-favorito'),
]