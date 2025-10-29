# mercado/pedido/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Pedido, ItemPedido
from produto.models import Produto
from django.db.models import Sum, F
from django.http import JsonResponse
from django.views.decorators.http import require_POST


@login_required
def adicionar_ao_carrinho(request, produto_id):
    produto = get_object_or_404(Produto, id=produto_id)
    # Pega o carrinho do usuário ou cria um novo
    pedido, _ = Pedido.objects.get_or_create(
        usuario=request.user, 
        status='carrinho'
    )
    
    # Pega a quantidade do formulário, com 1 como padrão
    quantidade = int(request.POST.get('quantidade', 1))

    # Pega o item no carrinho ou cria um novo
    item, _ = ItemPedido.objects.get_or_create(
        pedido=pedido,
        produto=produto,
        defaults={'preco': produto.preco, 'quantidade': 0}
    )
    
    # Adiciona a nova quantidade à existente
    item.quantidade += quantidade
    item.save()
    
    # Se a requisição for AJAX (feita pelo nosso script)
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        total_itens = pedido.itens.aggregate(total=Sum('quantidade'))['total'] or 0
        return JsonResponse({'status': 'ok', 'total_itens': total_itens})

    # Fallback para requisições normais (sem JavaScript)
    return redirect('pedido:ver_carrinho')


@login_required
@require_POST
def subtrair_item_carrinho(request, item_id):
    item = get_object_or_404(ItemPedido, id=item_id, pedido__usuario=request.user)
    if item.quantidade > 1:
        item.quantidade -= 1
        item.save()
    else:
        # Se a quantidade for 1, remove o item
        item.delete()
    return redirect('pedido:ver_carrinho')


@login_required
@require_POST
def adicionar_item_carrinho(request, item_id):
    item = get_object_or_404(ItemPedido, id=item_id, pedido__usuario=request.user)
    item.quantidade += 1
    item.save()
    return redirect('pedido:ver_carrinho')


@login_required
def ver_carrinho(request):
    carrinho = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
    
    subtotal = 0
    if carrinho:
        # Calcula o subtotal multiplicando o preço pela quantidade de cada item
        subtotal = carrinho.itens.aggregate(
            total=Sum(F('preco') * F('quantidade'))
        )['total'] or 0

    contexto = {
        'carrinho': carrinho,
        'subtotal': subtotal
    }
    return render(request, 'pedido/carrinho.html', contexto)

@login_required
def remover_do_carrinho(request, item_id):
    item = get_object_or_404(ItemPedido, id=item_id, pedido__usuario=request.user)
    item.delete()
    return redirect('pedido:ver_carrinho')

@login_required
def finalizar_pedido(request):
    carrinho = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
    if carrinho and carrinho.itens.exists():
        # Muda o status, "fechando" o carrinho e transformando-o em um pedido.
        carrinho.status = 'realizado'
        carrinho.save()
        # Opcional: Redirecione para uma página de sucesso ou histórico de pedidos.
        return redirect('pedido:historico_pedidos')
    # Se não houver carrinho, redireciona para a página de produtos.
    return redirect('produtos:listar-produtos')

@login_required
def historico_pedidos(request):
    pedidos = Pedido.objects.filter(usuario=request.user).exclude(status='carrinho').order_by('-data_criacao')
    return render(request, 'pedido/historico.html', {'pedidos': pedidos})