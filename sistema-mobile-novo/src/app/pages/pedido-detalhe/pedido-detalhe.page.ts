import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonNote, IonThumbnail, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { ApiService } from '../../core/api.service';

interface PedidoItem {
  id: number;
  quantidade: number;
  preco: string;
  total: string;
  produto: {
    id: number;
    nome: string;
    preco: string;
    imagem?: string | null;
  };
}

interface PedidoDetalhe {
  id: number;
  status: string;
  data_criacao: string | null;
  subtotal: string;
  itens: PedidoItem[];
}

@Component({
  selector: 'app-pedido-detalhe',
  templateUrl: './pedido-detalhe.page.html',
  styleUrls: ['./pedido-detalhe.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonList, IonItem, IonLabel, IonNote, IonThumbnail, IonSpinner, IonText,
    CommonModule
  ]
})
export class PedidoDetalhePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  loading = false;
  pedido?: PedidoDetalhe;

  async ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/tabs/perfil']);
      return;
    }
    await this.loadPedido(id);
  }

  async loadPedido(id: number) {
    this.loading = true;
    try {
      this.pedido = await this.apiService.get<PedidoDetalhe>(`/pedidos/api/pedido/${id}/`);
    } catch (error) {
      console.error('Erro ao carregar pedido:', error);
    } finally {
      this.loading = false;
    }
  }
}
