import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { register } from 'swiper/element/bundle';
import {
  IonContent, IonHeader, IonTitle, IonToolbar,
  LoadingController, NavController, ToastController,
  IonButtons, IonMenuButton, IonText, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonList, IonItem, IonItemSliding,
  IonThumbnail, IonLabel, IonItemOptions, IonItemOption,
  IonIcon, IonGrid, IonRow, IonCol, IonListHeader, IonButton,
  IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
// import { Veiculo } from './veiculo.model'; // Ajuste o caminho se necessário
// import { Usuario } from '../login/usuario.model';
import { HttpResponse } from '@capacitor/core';
import { addIcons } from 'ionicons'; // <--- Importe a função para adicionar ícones
import { 
  bagOutline, 
  cartOutline, 
  heartOutline, 
  heartSharp,
  homeOutline,
  personOutline,
  searchOutline,
  menuOutline
} from 'ionicons/icons';
import { IonicSlides } from '@ionic/angular';
import { 
  Navigation, 
  Pagination, 
  Autoplay, 
  EffectFade 
} from 'swiper/modules';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonIcon,
    IonButton
  ]
})
export class HomePage implements OnInit, OnDestroy {
  swiperModules = [IonicSlides, Navigation, Pagination, Autoplay, EffectFade];

  // --- Novas variáveis para a home mobile ---
  slidesCarrossel: Array<{ imagem: string; titulo?: string }> = [];
  categorias: Array<{ id?: number; nome: string }> = [];
  produtos: Array<{ id: number; nome: string; preco: number; imagem?: string; favorito?: boolean }> = [];

  // Estados de debug para diagnosticar tela branca / ausência de dados
  statusCarrossel: string = 'pendente';
  statusCategorias: string = 'pendente';
  statusProdutos: string = 'pendente';
  erros: string[] = [];
  apiBase: string = '';
  autenticado: boolean = false;
  private authSub?: any;
  carregandoInicial: boolean = true;

  constructor(
    public storage: Storage,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_carregamento: LoadingController,
    private api: ApiService,
    private auth: AuthService,
  ) {
    register(); // Registra os elementos personalizados do Swiper
    // Registra os ícones
    addIcons({
      bagOutline,
      cartOutline,
      heartOutline,
      heartSharp,
      homeOutline,
      personOutline,
      searchOutline,
      menuOutline
    });
  }

  async ngOnInit() {
    console.log('[HomePage] ngOnInit');
    // Storage já inicializado via APP_INITIALIZER; manter chamada defensiva
    try { await this.storage.create(); } catch {}
    this.autenticado = await this.auth.isAuthenticated();
    // Subscribe para mudanças de autenticação e recarregar dados quando logar/deslogar
    this.authSub = this.auth.isAuthenticatedStream().subscribe(async (state) => {
      this.autenticado = state;
      if (state) {
        this.statusCategorias = 'pendente';
        this.statusProdutos = 'pendente';
        await this.carregarCategorias();
        await this.carregarProdutos();
      }
    });
    this.carregarSlides();
    // Carrega sempre (endpoints públicos agora)
    this.carregarCategorias();
    this.carregarProdutos();
    this.apiBase = this.api.getBase();
    this.carregandoInicial = false;
  }
  ngOnDestroy() {
    if (this.authSub) this.authSub.unsubscribe();
  }

  async doRefresh(event: any) {
    try {
      await Promise.all([
        this.carregarSlides(),
        this.carregarCategorias(),
        this.carregarProdutos(),
      ]);
    } finally {
      event.target.complete();
    }
  }

  async logout() {
    await this.auth.logout();
    this.toast('Sessão encerrada.');
  }

  private async carregarSlides() {
    try {
      const base = environment.apiBaseUrl?.replace(/\/$/, '');
      const r: HttpResponse = await this.api.get('/api/carrossel/', {}, false);
      console.log('[HomePage] carrossel status', r.status, r.data);
      if (r.status === 200) {
        this.slidesCarrossel = (r.data as any[]).map((s: any) => ({
          imagem: s.imagem ? (s.imagem.startsWith('http') ? s.imagem : `${base}${s.imagem.startsWith('/') ? '' : '/'}${s.imagem}`) : 'assets/slides/slide-default.jpg',
          titulo: s.titulo
        }));
        this.statusCarrossel = `ok (${this.slidesCarrossel.length})`;
      } else {
        this.statusCarrossel = `falha (${r.status})`;
      }
    } catch (e) {
      console.warn('Falha ao carregar carrossel', e);
      this.statusCarrossel = 'erro';
      this.erros.push('carrossel');
    }
  }

  private async carregarProdutos() {
    const loading = await this.controle_carregamento.create({ message: 'Carregando produtos...', duration: 15000 });
    await loading.present();
    try {
      // Endpoints tornados públicos; sempre tenta sem exigir auth
      const resposta: HttpResponse = await this.api.get('/produtos/api/', {}, false);
      console.log('[HomePage] produtos status', resposta.status, resposta.data);
      if (resposta.status === 200) {
        const base = environment.apiBaseUrl?.replace(/\/$/, '');
        this.produtos = (resposta.data as any[]).map((p: any) => {
          let img = p.imagem as string | null;
          if (img) {
            img = img.startsWith('http') ? img : `${base}${img.startsWith('/') ? '' : '/'}${img}`;
          }
          return {
            id: p.id,
            nome: p.nome,
            preco: Number(p.preco),
            imagem: img || undefined,
            favorito: false,
          };
        });
        this.statusProdutos = `ok (${this.produtos.length})`;
      } else {
        this.statusProdutos = `falha (${resposta.status})`;
        this.toast(`Falha ao carregar produtos: ${resposta.status}`);
      }
    } catch (e) {
      console.error(e);
      this.statusProdutos = 'erro';
      this.erros.push('produtos');
      this.toast('Erro ao comunicar com a API. Verifique a URL e a rede.');
    } finally {
      loading.dismiss();
    }
  }

  private async carregarCategorias() {
    try {
      const r: HttpResponse = await this.api.get('/produtos/api/categorias/', {}, false);
      console.log('[HomePage] categorias status', r.status, r.data);
      if (r.status === 200) {
        this.categorias = r.data as any[];
        this.statusCategorias = `ok (${this.categorias.length})`;
      } else {
        this.statusCategorias = `falha (${r.status})`;
      }
    } catch (e) {
      console.warn('Falha ao carregar categorias', e);
      this.statusCategorias = 'erro';
      this.erros.push('categorias');
    }
  }

  irParaLogin() {
    this.controle_navegacao.navigateForward('/login');
  }

  private async toast(msg: string) {
    const t = await this.controle_toast.create({ message: msg, duration: 2500 });
    t.present();
  }

  // --- Métodos para interação ---
  abrirCategoria(categoria: any) {
    this.controle_navegacao.navigateForward('/produtos');
  }

  adicionarAoCarrinho(produto: any) {
    this.adicionarAoCarrinhoAPI(produto);
  }

  toggleFavorito(produto: any) {
    this.toggleFavoritoAPI(produto);
  }

  private async adicionarAoCarrinhoAPI(produto: any) {
  const token = await this.auth.getToken();
  if (!token) {
      this.toast('Login necessário para adicionar ao carrinho.');
      this.controle_navegacao.navigateForward('/login');
      return;
    }
    const loading = await this.controle_carregamento.create({ message: 'Adicionando ao carrinho...', duration: 10000 });
    await loading.present();
    try {
  console.log('[Carrinho] POST adicionar', produto.id);
  // Corrige prefixo: backend usa /pedidos/ (confirmado em sistema/urls.py)
  const res = await this.api.post('/pedidos/api/adicionar/', { produto_id: produto.id, quantidade: 1 });
      console.log('[Carrinho] resposta', res.status, res.data);
      if (res.status === 200) {
        this.toast('Adicionado ao carrinho.');
      } else if (res.status === 401) {
        this.toast('Sessão expirada. Faça login novamente.');
        this.controle_navegacao.navigateForward('/login');
      } else {
        this.toast(`Falha ao adicionar: ${res.status}`);
      }
    } catch (e) {
      console.error(e);
      this.toast('Erro ao adicionar ao carrinho.');
    } finally {
      loading.dismiss();
    }
  }

  private async toggleFavoritoAPI(produto: any) {
  const token = await this.auth.getToken();
  if (!token) {
      this.toast('Login necessário para favoritar.');
      this.controle_navegacao.navigateForward('/login');
      return;
    }
    try {
  console.log('[Favoritos] POST toggle', produto.id);
  const res = await this.api.post('/favoritos/api/toggle/', { produto_id: produto.id });
      console.log('[Favoritos] resposta', res.status, res.data);
      if (res.status === 200) {
        produto.favorito = !!res.data?.is_favorited;
      } else {
        this.toast(`Falha ao favoritar: ${res.status}`);
      }
    } catch (e) {
      console.error(e);
      this.toast('Erro ao atualizar favorito.');
    }
  }
}