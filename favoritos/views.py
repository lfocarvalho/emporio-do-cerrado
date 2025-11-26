# mercado/favoritos/views.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Favorito
from produto.models import Produto
from django.http import JsonResponse

# DRF imports para API
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authentication import TokenAuthentication
from produto.serializers import SerializadorProduto

@login_required
def toggle_favorito(request, produto_id):
    # Apenas requisições POST são permitidas para alterar dados
    if request.method == 'POST':
        produto = get_object_or_404(Produto, id=produto_id)
        # Tenta encontrar um favorito existente. Se não encontrar, cria um.
        favorito, created = Favorito.objects.get_or_create(usuario=request.user, produto=produto)

        # Se não foi criado agora, significa que já existia, então removemos.
        if not created:
            favorito.delete()
            is_favorited = False
        else:
            is_favorited = True

        # Retorna uma resposta JSON informando o novo status
        return JsonResponse({'status': 'ok', 'is_favorited': is_favorited})
    
    return JsonResponse({'status': 'error', 'message': 'Método inválido'}, status=405)


@login_required
def listar_favoritos(request):
    # Busca os produtos favoritados pelo usuário logado
    produtos_favoritos = Produto.objects.filter(favorito__usuario=request.user)
    
    # Adiciona a lista de IDs para que o coração apareça preenchido nesta página também
    favoritos_ids = list(produtos_favoritos.values_list('id', flat=True))

    context = {
        'lista_produtos': produtos_favoritos,
        'favoritos_ids': favoritos_ids,
        'is_favoritos': True
    }
    # Usa template dedicado de favoritos
    return render(request, 'favoritos/listar.html', context)


class APIListarFavoritos(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        produtos = Produto.objects.filter(favorito__usuario=request.user)
        serializer = SerializadorProduto(produtos, many=True)
        return Response(serializer.data)


class APIToggleFavorito(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        produto_id = request.data.get('produto_id')
        if not produto_id:
            return Response({'detail': 'produto_id é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)

        produto = get_object_or_404(Produto, id=produto_id)
        favorito, created = Favorito.objects.get_or_create(usuario=request.user, produto=produto)
        if not created:
            favorito.delete()
            return Response({'status': 'ok', 'is_favorited': False})
        return Response({'status': 'ok', 'is_favorited': True})