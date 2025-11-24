import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { ApiService } from '../../core/api.service';

interface Categoria {
  id: number;
  nome: string;
  imagem: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  foto?: string | null;
  imagem?: string | null;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonRefresher, IonRefresherContent,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonCardContent, IonSpinner, IonText, CommonModule
  ]
})
export class HomePage implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  loadingCategorias = false;
  loadingProdutos = false;

  async ngOnInit() {
    await this.loadCategorias();
    await this.loadProdutos();
  }

  async loadCategorias() {
    this.loadingCategorias = true;
    try {
      console.log('Carregando categorias...');
      this.categorias = await this.apiService.get<Categoria[]>('/produtos/api/categorias/');
      console.log('Categorias carregadas:', this.categorias);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      this.loadingCategorias = false;
    }
  }

  async loadProdutos() {
    this.loadingProdutos = true;
    try {
      console.log('Carregando produtos...');
      const result = await this.apiService.get<any>('/produtos/api/');
      console.log('Produtos recebidos:', result);
      this.produtos = result.results || result || [];
      // Limita a 5 produtos recentes
      this.produtos = this.produtos.slice(0, 5);
      console.log('Produtos exibidos:', this.produtos);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      this.loadingProdutos = false;
    }
  }

  async handleRefresh(event: any) {
    await Promise.all([this.loadCategorias(), this.loadProdutos()]);
    event.target.complete();
  }

  navigateToCategoria(categoriaNome: string) {
    console.log('Navegando para categoria:', categoriaNome);
    this.router.navigate(['/tabs/produtos'], { queryParams: { categoria: categoriaNome } });
  }

  navigateToProduto(produtoId: number) {
    console.log('Navegando para produto:', produtoId);
    this.router.navigate(['/produto', produtoId]);
  }
}
