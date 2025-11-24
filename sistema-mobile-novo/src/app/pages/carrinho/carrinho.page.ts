import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonRefresher, IonRefresherContent,
  IonList, IonItem, IonThumbnail, IonLabel, IonNote, IonCard, IonCardContent,
  IonButton, IonSpinner, IonText, IonIcon, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash, add, remove } from 'ionicons/icons';
import { ApiService } from '../../core/api.service';
import { CartService } from '../../core/cart.service';
import { Subscription } from 'rxjs';

interface ItemCarrinho {
  id: number;
  produto: {
    id: number;
    nome: string;
    preco: number | string;
    foto?: string | null;
    imagem?: string | null;
  };
  quantidade: number;
  total?: number | string; // backend envia 'total'
}

@Component({
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonRefresher, IonRefresherContent,
    IonList, IonItem, IonThumbnail, IonLabel, IonNote, IonCard, IonCardContent,
    IonButton, IonSpinner, IonText, IonIcon, CommonModule
  ]
})
export class CarrinhoPage implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  itens: ItemCarrinho[] = [];
  loading = false;
  subtotal = 0;
  private sub?: Subscription;

  constructor() {
    addIcons({ trash, add, remove });
  }

  async ngOnInit() {
    await this.loadCarrinho();
    // Recarrega quando alguém adicionar item ao carrinho
    this.sub = this.cartService.refresh$.subscribe(() => this.loadCarrinho());
  }

  ionViewWillEnter() {
    // Ao entrar na aba, garante que atualiza
    this.loadCarrinho();
  }

  async loadCarrinho() {
    this.loading = true;
    try {
      const response = await this.apiService.get<any>('/pedidos/api/carrinho/');
      this.itens = (response?.itens || []).map((it: any) => ({
        id: it.id,
        produto: {
          id: it.produto?.id,
          nome: it.produto?.nome,
          preco: it.produto?.preco,
          imagem: it.produto?.imagem ?? null,
          foto: it.produto?.foto ?? null,
        },
        quantidade: it.quantidade,
        total: it.total
      }));
      this.subtotal = Number.parseFloat(response?.subtotal ?? '0') || 0;
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      this.loading = false;
    }
  }

  calcularTotal(): number {
    // Preferir subtotal fornecido pelo backend
    if (this.subtotal) return this.subtotal;
    return this.itens.reduce((total, item) => total + (Number(item.total) || 0), 0);
  }

  async handleRefresh(event: any) {
    await this.loadCarrinho();
    event.target.complete();
  }

  async incrementar(item: ItemCarrinho) {
    const novaQuantidade = (item.quantidade || 0) + 1;
    try {
      await this.apiService.post('/pedidos/api/alterar/', {
        item_id: item.id,
        quantidade: novaQuantidade
      });
      await this.loadCarrinho();
    } catch (error) {
      console.error('Erro ao incrementar item:', error);
    }
  }

  async decrementar(item: ItemCarrinho) {
    const novaQuantidade = (item.quantidade || 0) - 1;
    try {
      await this.apiService.post('/pedidos/api/alterar/', {
        item_id: item.id,
        quantidade: Math.max(0, novaQuantidade)
      });
      await this.loadCarrinho();
    } catch (error) {
      console.error('Erro ao decrementar item:', error);
    }
  }

  async removerItem(item: ItemCarrinho) {
    try {
      await this.apiService.post('/pedidos/api/remover/', { item_id: item.id });
      await this.loadCarrinho();
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
    }
  }

  async finalizarPedido() {
    try {
      await this.apiService.post('/pedidos/api/finalizar/', {});
      // Limpa carrinho local e atualiza subtotal
      this.itens = [];
      this.subtotal = 0;
      const toast = await this.toastController.create({
        message: 'Pedido finalizado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'bottom'
      });
      await toast.present();
      // Redireciona para a página de produtos
      this.router.navigate(['/tabs/produtos']);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      const toast = await this.toastController.create({
        message: 'Não foi possível finalizar o pedido',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
      await toast.present();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  totalItem(item: ItemCarrinho): number {
    const total = Number(item.total);
    if (!Number.isNaN(total) && total > 0) return total;
    const preco = Number(item.produto?.preco ?? 0);
    return preco * (item.quantidade || 0);
  }
}
