import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonRefresher, IonRefresherContent,
  IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonThumbnail,
  IonLabel, IonIcon, IonSpinner, IonText, IonButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { ApiService } from '../../core/api.service';
import { FavoritesService } from '../../core/favorites.service';
import { Subscription } from 'rxjs';

// A API de favoritos retorna diretamente uma lista de produtos
// (ver Django: APIListarFavoritos usa SerializadorProduto)
interface ProdutoFavorito {
  id: number;
  nome: string;
  preco: number | string;
  descricao?: string | null;
  imagem?: string | null;
  foto?: string | null; // fallback para compatibilidade
}

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonRefresher, IonRefresherContent,
    IonItemSliding, IonItem, IonItemOptions, IonItemOption, IonThumbnail,
    IonLabel, IonIcon, IonSpinner, IonText, IonButton, CommonModule
  ]
})
export class FavoritosPage implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private favoritesService = inject(FavoritesService);

  favoritos: ProdutoFavorito[] = [];
  loading = false;
  private sub?: Subscription;

  constructor() {
    addIcons({ trash });
  }

  async ngOnInit() {
    await this.loadFavoritos();
    // Ouvir eventos de atualização (ex.: toggle no detalhe do produto)
    this.sub = this.favoritesService.refresh$.subscribe(() => this.loadFavoritos());
  }

  ionViewWillEnter() {
    // Garante atualização ao entrar na aba/página
    this.loadFavoritos();
  }

  async loadFavoritos() {
    this.loading = true;
    try {
      const res = await this.apiService.get<any[]>('/favoritos/api/');
      // Normaliza para um array de produtos compatível com o template
      this.favoritos = (res || []).map((item: any) => {
        // Se vier aninhado (caso antigo), extrai o produto
        const p = item?.produto ? item.produto : item;
        return {
          id: p?.id,
          nome: p?.nome ?? '',
          preco: Number(p?.preco ?? 0),
          descricao: p?.descricao ?? null,
          imagem: p?.imagem ?? null,
          foto: p?.foto ?? null,
        } as ProdutoFavorito;
      }).filter((p: ProdutoFavorito) => !!p.id);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    } finally {
      this.loading = false;
    }
  }

  async removerFavorito(produtoId: number) {
    try {
      // O backend utiliza toggle para remover/adicionar favorito
      await this.apiService.post('/favoritos/api/toggle/', { produto_id: produtoId });
      this.favoritos = this.favoritos.filter(f => f.id !== produtoId);
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
    }
  }

  async handleRefresh(event: any) {
    await this.loadFavoritos();
    event.target.complete();
  }

  navigateToProduto(produtoId: number) {
    this.router.navigate(['/produto', produtoId]);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
