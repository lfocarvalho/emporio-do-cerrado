# mercado/pedido/context_processors.py

from .models import Pedido
from django.db.models import Sum

def cart_context(request):
    """
    Torna a quantidade total de itens no carrinho acessível em todos os templates.
    """
    total_itens = 0
    if request.user.is_authenticated:
        carrinho = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
        if carrinho:
            # Soma a 'quantidade' de todos os itens no carrinho
            total_itens = carrinho.itens.aggregate(total=Sum('quantidade'))['total'] or 0
            
    return {'total_itens_carrinho': total_itens}