import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar,
  IonRefresher, IonRefresherContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardSubtitle, IonCardContent, IonGrid,
  IonRow, IonCol, IonSpinner, IonText, IonSelect, IonSelectOption
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
    IonRow, IonCol, IonSpinner, IonText, IonSelect, IonSelectOption,
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
  categorias: { id: number, nome: string }[] = [];
  selectedCategoria: string = 'todas';

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.categoriaNome = params['categoria'] || undefined;
      this.selectedCategoria = this.categoriaNome || 'todas';
      this.loadProdutos();
    });
    await this.loadCategorias();
  }

  async loadProdutos() {
    this.loading = true;
    try {
      const params: Record<string, string> = {};
      if (this.categoriaNome) {
        params['categoria'] = this.categoriaNome;
      }

      const result = await this.apiService.get<any>('/produtos/api/', params);
      // Normaliza diferentes formatos de resposta (com ou sem paginação)
      const lista = (result && (result.results || result.items)) ? (result.results || result.items) : result;
      this.produtosOriginal = Array.isArray(lista) ? lista : [];
      // Reaplica a busca atual para manter consistência ao trocar categoria ou recarregar
      this.onSearch();
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      this.produtosOriginal = [];
      this.produtos = [];
    } finally {
      this.loading = false;
    }
  }

  async loadCategorias() {
    try {
      this.categorias = await this.apiService.get<any>('/produtos/api/categorias/');
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  }

  onSearch() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.produtos = [...this.produtosOriginal];
      return;
    }
    this.produtos = this.produtosOriginal.filter((produto: any) => {
      const nome = (produto?.nome || '').toLowerCase();
      const desc = (produto?.descricao || '').toLowerCase();
      return nome.includes(term) || desc.includes(term);
    });
  }

  resetSearch() {
    this.searchTerm = '';
    this.produtos = [...this.produtosOriginal];
  }

  async handleRefresh(event: any) {
    await this.loadProdutos();
    event.target.complete();
  }

  navigateToProduto(produtoId: number) {
    this.router.navigate(['/produto', produtoId]);
  }

  async onCategoriaChange(ev: CustomEvent) {
    const valor = ev.detail?.value as string;
    this.selectedCategoria = valor;
    this.categoriaNome = valor === 'todas' ? undefined : valor;
    // Atualiza a URL (para compartilhamento) e recarrega
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.categoriaNome ? { categoria: this.categoriaNome } : {},
      queryParamsHandling: ''
    });
    await this.loadProdutos();
    // Se há termo de busca digitado, mantém filtragem após recarregar
    this.onSearch();
  }
}
