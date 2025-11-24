import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar,
  IonRefresher, IonRefresherContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid,
  IonRow, IonCol, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { ApiService } from '../../core/api.service';

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  foto?: string | null;
  imagem?: string | null;
}

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar,
    IonRefresher, IonRefresherContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid,
    IonRow, IonCol, IonSpinner, IonText,
    CommonModule, FormsModule
  ]
})
export class ProdutosPage implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  produtos: Produto[] = [];
  produtosOriginal: Produto[] = [];
  searchTerm = '';
  loading = false;
  categoriaNome?: string;

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoriaNome = params['categoria'] || undefined;
      this.loadProdutos();
    });
  }

  async loadProdutos() {
    this.loading = true;
    try {
      const params: Record<string, string> = {};
      if (this.categoriaNome) {
        params['categoria'] = this.categoriaNome;
      }

      const result = await this.apiService.get<any>('/produtos/api/', params);
      this.produtosOriginal = result.results || result || [];
      this.produtos = [...this.produtosOriginal];
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      this.loading = false;
    }
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.produtos = [...this.produtosOriginal];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.produtos = this.produtosOriginal.filter(produto =>
      produto.nome.toLowerCase().includes(term) ||
      produto.descricao.toLowerCase().includes(term)
    );
  }

  async handleRefresh(event: any) {
    await this.loadProdutos();
    event.target.complete();
  }

  navigateToProduto(produtoId: number) {
    this.router.navigate(['/produto', produtoId]);
  }
}
