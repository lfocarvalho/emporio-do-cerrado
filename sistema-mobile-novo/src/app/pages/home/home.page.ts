import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonRefresher, IonRefresherContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonSpinner, IonText, IonButton, IonIcon
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
    IonCardContent, IonSpinner, IonText, IonButton, IonIcon, CommonModule
  ]
})
export class HomePage implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);

  categorias: Categoria[] = [];
  categoriasDestaque: Categoria[] = [];
  produtos: Produto[] = [];
  loadingCategorias = false;
  loadingProdutos = false;
  carrosselImagens: string[] = [];
  private carouselIndex = 0;
  private carouselTimer?: any;
  logoUrl = '';

  async ngOnInit() {
    // Define logo (usa servidor do Django para servir /static/...)
    this.logoUrl = this.apiService.toAbsoluteMediaUrl('/static/imagens/logo_cerrado_white.png');
    await Promise.all([this.loadCategorias(), this.loadProdutos(), this.loadCarrossel()]);
    this.startCarouselAutoScroll();
  }

  async loadCategorias() {
    this.loadingCategorias = true;
    try {
      console.log('Carregando categorias...');
      this.categorias = await this.apiService.get<Categoria[]>('/produtos/api/categorias/');
      console.log('Categorias carregadas:', this.categorias);
      // Normaliza URLs de imagem
      this.categorias = this.categorias.map(c => ({
        ...c,
        imagem: c.imagem ? this.apiService.toAbsoluteMediaUrl(c.imagem) : c.imagem
      }));
      // Seleciona categorias principais por nome (fallback: primeiras 8)
      const preferidas = new Set([
        'Açougue e Peixaria',
        'Mercearia',
        'Frutas',
        'Bebidas',
        'Doces',
        'Frios e Laticínios',
        'Higiene e Limpeza',
        'Artesanais'
      ]);
      const porPreferencia = this.categorias.filter(c => preferidas.has(c.nome));
      this.categoriasDestaque = (porPreferencia.length ? porPreferencia : this.categorias).slice(0, 8);
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
      this.produtos = (result?.results ?? result ?? []) as Produto[];
      // Normaliza URLs de imagem
      this.produtos = this.produtos.map(p => ({
        ...p,
        foto: p.foto ? this.apiService.toAbsoluteMediaUrl(p.foto) : p.foto,
        imagem: p.imagem ? this.apiService.toAbsoluteMediaUrl(p.imagem as string) : p.imagem
      }));
      this.produtos = this.produtos.slice(0, 5);
      console.log('Produtos exibidos:', this.produtos);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      this.loadingProdutos = false;
    }
  }

  async loadCarrossel() {
    try {
      // Tenta buscar do backend (ajuste a rota conforme sua API)
      const data = await this.apiService.get<any>('/api/carrossel/');
      const imgs = (data?.imagens || data || []) as Array<{imagem?: string; url?: string} | string>;
      this.carrosselImagens = imgs
        .map((i: any) => typeof i === 'string' ? i : (i.imagem || i.url))
        .filter((v: any) => !!v)
        .map((u: string) => this.apiService.toAbsoluteMediaUrl(u));
    } catch (error) {
      console.warn('Carrossel não disponível, usando imagens padrão.');
      // Fallback para ícone existente (evita 404 de assets/img/* ausente)
      this.carrosselImagens = [
        'assets/icon/favicon.png',
        'assets/icon/favicon.png',
        'assets/icon/favicon.png',
      ];
    }
  }

  private startCarouselAutoScroll() {
    // Auto rolagem simples: avança a cada 4s
    this.stopCarouselAutoScroll();
    this.carouselTimer = setInterval(() => {
      const track = document.querySelector('.carousel-track');
      const items = track ? Array.from(track.querySelectorAll('img')) : [];
      if (!track || items.length === 0) return;
      this.carouselIndex = (this.carouselIndex + 1) % items.length;
      const el = items[this.carouselIndex] as HTMLElement;
      el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }, 4000);
  }

  private stopCarouselAutoScroll() {
    if (this.carouselTimer) {
      clearInterval(this.carouselTimer);
      this.carouselTimer = undefined;
    }
  }

  async handleRefresh(event: any) {
    await Promise.all([this.loadCategorias(), this.loadProdutos(), this.loadCarrossel()]);
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

  verTodasCategorias() {
    this.router.navigate(['/tabs/produtos']);
  }
}
