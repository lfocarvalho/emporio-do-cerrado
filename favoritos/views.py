# mercado/favoritos/views.py
from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Favorito
from produto.models import Produto
from django.http import JsonResponse

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
        'favoritos_ids': favoritos_ids
    }
    # Reutiliza o template de listagem de produtos
    return render(request, 'produto/listar.html', context)