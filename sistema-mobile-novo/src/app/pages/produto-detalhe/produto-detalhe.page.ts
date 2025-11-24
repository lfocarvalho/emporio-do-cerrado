import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonButton, IonIcon, IonSpinner, IonText, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, cart } from 'ionicons/icons';
import { ApiService } from '../../core/api.service';
import { CartService } from '../../core/cart.service';
import { FavoritesService } from '../../core/favorites.service';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  foto?: string | null;
  imagem?: string | null;
}

@Component({
  selector: 'app-produto-detalhe',
  templateUrl: './produto-detalhe.page.html',
  styleUrls: ['./produto-detalhe.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonSpinner, IonText, CommonModule
  ]
})
export class ProdutoDetalhePage implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);
  private cartService = inject(CartService);
  private favoritesService = inject(FavoritesService);

  produto: Produto | null = null;
  loading = false;
  adicionando = false;
  isFavorito = false;

  constructor() {
    addIcons({ heart, heartOutline, cart });
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadProduto(+id);
      await this.checkFavorito(+id);
    }
  }

  async loadProduto(id: number) {
    this.loading = true;
    try {
      this.produto = await this.apiService.get<Produto>(`/produtos/api/${id}/`);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    } finally {
      this.loading = false;
    }
  }

  async checkFavorito(id: number) {
    try {
      const favoritos = await this.apiService.get<any[]>('/favoritos/api/');
      this.isFavorito = favoritos.some((f: any) => f.produto?.id === id || f.id === id);
    } catch (error) {
      console.error('Erro ao verificar favorito:', error);
    }
  }

  async toggleFavorito() {
    if (!this.produto) return;

    try {
      // Backend expõe um endpoint de toggle: POST /favoritos/api/toggle/ { produto_id }
      const res = await this.apiService.post('/favoritos/api/toggle/', { produto_id: this.produto.id });
      // Se o toggle removeu, backend retorna is_favorited: false
      // Se adicionou, retorna is_favorited: true
      if ((res as any)?.is_favorited === false) {
        this.isFavorito = false;
        await this.showToast('Removido dos favoritos');
        this.favoritesService.triggerRefresh();
      } else {
        this.isFavorito = true;
        await this.showToast('Adicionado aos favoritos');
        this.favoritesService.triggerRefresh();
      }
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      await this.showToast('Erro ao atualizar favoritos');
    }
  }

  async adicionarAoCarrinho() {
    if (!this.produto) return;

    this.adicionando = true;
    try {
      // Endpoint correto no backend: POST /pedidos/api/adicionar/ { produto_id, quantidade }
      await this.apiService.post('/pedidos/api/adicionar/', {
        produto_id: this.produto.id,
        quantidade: 1
      });
      await this.showToast('Produto adicionado ao carrinho!');
      // Notifica outras telas para recarregar o carrinho
      this.cartService.triggerRefresh();
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      await this.showToast('Erro ao adicionar ao carrinho');
    } finally {
      this.adicionando = false;
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
