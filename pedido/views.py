# pedido/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Pedido, ItemPedido
from produto.models import Produto
from django.db.models import Sum, F

@login_required
def adicionar_ao_carrinho(request, produto_id):
    produto = get_object_or_404(Produto, id=produto_id)
    # Pega o carrinho do usuário ou cria um novo
    pedido, criado = Pedido.objects.get_or_create(
        usuario=request.user, 
        status='carrinho'
    )
    # Pega o item no carrinho ou cria um novo
    item, item_criado = ItemPedido.objects.get_or_create(
        pedido=pedido,
        produto=produto,
        defaults={'preco': produto.preco}
    )
    # Se o item já existia, apenas aumenta a quantidade
    if not item_criado:
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