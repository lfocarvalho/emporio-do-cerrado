# mercado/pedido/views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import Pedido, ItemPedido
from produto.models import Produto
from django.db.models import Sum, F
from django.http import JsonResponse
from django.views.decorators.http import require_POST

# DRF imports para API
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication


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
        return JsonResponse({'status': 'ok', 'total_itens': total_itens, 'message': f'{quantidade}x {produto.nome} adicionado ao carrinho.'})

    messages.success(request, f'{quantidade}x {produto.nome} adicionado ao carrinho.')
    return redirect('pedido:ver_carrinho')


@login_required
@require_POST
def subtrair_item_carrinho(request, item_id):
    item = get_object_or_404(ItemPedido, id=item_id, pedido__usuario=request.user)
    if item.quantidade > 1:
        item.quantidade -= 1
        item.save()
        messages.info(request, f'Quantidade de {item.produto.nome} diminuída para {item.quantidade}.')
    else:
        # Se a quantidade for 1, remove o item
        messages.warning(request, f'{item.produto.nome} removido do carrinho.')
        item.delete()
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        pedido = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
        total_itens = pedido.itens.aggregate(total=Sum('quantidade'))['total'] if pedido else 0
        return JsonResponse({'status': 'ok', 'total_itens': total_itens, 'message': messages.get_messages(request)._queued_messages[-1].message if messages.get_messages(request) else ''})
    return redirect('pedido:ver_carrinho')


@login_required
@require_POST
def adicionar_item_carrinho(request, item_id):
    item = get_object_or_404(ItemPedido, id=item_id, pedido__usuario=request.user)
    item.quantidade += 1
    item.save()
    messages.success(request, f'Quantidade de {item.produto.nome} aumentada para {item.quantidade}.')
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        pedido = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
        total_itens = pedido.itens.aggregate(total=Sum('quantidade'))['total'] if pedido else 0
        return JsonResponse({'status': 'ok', 'total_itens': total_itens, 'message': messages.get_messages(request)._queued_messages[-1].message if messages.get_messages(request) else ''})
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
    messages.warning(request, f'{item.produto.nome} removido do carrinho.')
    item.delete()
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        pedido = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
        total_itens = pedido.itens.aggregate(total=Sum('quantidade'))['total'] if pedido else 0
        return JsonResponse({'status': 'ok', 'total_itens': total_itens, 'message': messages.get_messages(request)._queued_messages[-1].message if messages.get_messages(request) else ''})
    return redirect('pedido:ver_carrinho')

@login_required
def finalizar_pedido(request):
    carrinho = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
    if carrinho and carrinho.itens.exists():
        # Muda o status, "fechando" o carrinho e transformando-o em um pedido.
        carrinho.status = 'realizado'
        carrinho.save()
        messages.success(request, 'Pedido efetuado com sucesso!')
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'status': 'ok', 'message': 'Pedido efetuado com sucesso!'})
        return redirect('pedido:historico_pedidos')
    # Se não houver carrinho, redireciona para a página de produtos.
    return redirect('produtos:listar-produtos')

@login_required
def historico_pedidos(request):
    pedidos = Pedido.objects.filter(usuario=request.user).exclude(status='carrinho').order_by('-data_criacao')
    return render(request, 'pedido/historico.html', {'pedidos': pedidos})


# -------------------- API DRF --------------------

def _get_or_create_carrinho(user):
    pedido, _ = Pedido.objects.get_or_create(usuario=user, status='carrinho')
    return pedido


class APIGetCarrinho(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pedido = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
        if not pedido:
            return Response({'itens': [], 'subtotal': 0})
        itens = [
            {
                'id': item.id,
                'produto': {
                    'id': item.produto.id,
                    'nome': item.produto.nome,
                    'preco': str(item.produto.preco),
                    'imagem': item.produto.imagem.url if item.produto.imagem else None,
                },
                'quantidade': item.quantidade,
                'preco': str(item.preco),
                'total': str(item.preco * item.quantidade),
            }
            for item in pedido.itens.select_related('produto').all()
        ]
        subtotal = pedido.itens.aggregate(total=Sum(F('preco') * F('quantidade')))['total'] or 0
        return Response({'itens': itens, 'subtotal': str(subtotal)})


class APIAdicionarAoCarrinho(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        produto_id = request.data.get('produto_id')
        quantidade = int(request.data.get('quantidade', 1))
        if not produto_id:
            return Response({'detail': 'produto_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        produto = get_object_or_404(Produto, id=produto_id)
        pedido = _get_or_create_carrinho(request.user)
        item, _ = ItemPedido.objects.get_or_create(
            pedido=pedido,
            produto=produto,
            defaults={'preco': produto.preco, 'quantidade': 0}
        )
        item.quantidade += max(1, quantidade)
        item.save()
        return Response({'status': 'ok', 'item_id': item.id})


class APIRemoverDoCarrinho(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_id = request.data.get('item_id')
        if not item_id:
            return Response({'detail': 'item_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        item = get_object_or_404(ItemPedido, id=item_id, pedido__usuario=request.user)
        item.delete()
        return Response({'status': 'ok'})


class APIAlterarItemCarrinho(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_id = request.data.get('item_id')
        quantidade = request.data.get('quantidade')
        if item_id is None or quantidade is None:
            return Response({'detail': 'item_id e quantidade são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)
        item = get_object_or_404(ItemPedido, id=item_id, pedido__usuario=request.user)
        quantidade = int(quantidade)
        if quantidade <= 0:
            item.delete()
            return Response({'status': 'ok', 'deleted': True})
        item.quantidade = quantidade
        item.save()
        return Response({'status': 'ok'})


class APIFinalizarPedido(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        pedido = Pedido.objects.filter(usuario=request.user, status='carrinho').first()
        if not pedido or not pedido.itens.exists():
            return Response({'detail': 'Carrinho vazio'}, status=status.HTTP_400_BAD_REQUEST)
        pedido.status = 'realizado'
        pedido.save()
        return Response({'status': 'ok', 'pedido_id': pedido.id})


class APIHistoricoPedidos(APIView):
    """Lista pedidos do usuário (exceto carrinho)."""
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pedidos = Pedido.objects.filter(usuario=request.user).exclude(status='carrinho').order_by('-data_criacao')
        data = [
            {
                'id': p.id,
                'status': p.status,
                'data_criacao': p.data_criacao.isoformat() if p.data_criacao else None,
                'subtotal': p.itens.aggregate(total=Sum(F('preco') * F('quantidade')))['total'] or 0,
            }
            for p in pedidos
        ]
        return Response(data)