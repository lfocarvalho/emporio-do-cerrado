import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonSearchbar, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { NavController, ToastController, LoadingController } from '@ionic/angular';
import { HttpResponse } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-produtos',
  templateUrl: './produtos.page.html',
  styleUrls: ['./produtos.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonSearchbar, IonSegment, IonSegmentButton, IonLabel],
  providers: [Storage]
})
export class ProdutosPage implements OnInit {
  categorias: Array<{id:number; nome:string}> = [];
  categoriaSelecionada?: number;
  produtos: Array<{ id:number; nome:string; preco:number; imagem?:string; favorito?: boolean }> = [];
  busca: string = '';

  constructor(
    private storage: Storage,
    private nav: NavController,
    private toast: ToastController,
    private loading: LoadingController,
    private api: ApiService,
    private auth: AuthService,
  ) {}

  async ngOnInit() {
    console.log('[ProdutosPage] ngOnInit');
    await this.storage.create();
    await this.carregarCategorias();
    await this.carregarProdutos();
  }

  private async carregarCategorias() {
    try {
      const r: HttpResponse = await this.api.get('/produtos/api/categorias/');
      if (r.status === 200) {
        this.categorias = r.data as any[];
      }
    } catch(err) { console.error(err); }
  }

  async carregarProdutos() {
    const loading = await this.loading.create({ message: 'Carregando...', duration: 12000 });
    await loading.present();
    const params: any = {};
    if (this.categoriaSelecionada) params['categoria'] = this.categorias.find(c=>c.id===this.categoriaSelecionada)?.nome;
    if (this.busca) params['busca'] = this.busca;

    try {
      const r: HttpResponse = await this.api.get('/produtos/api/', { params });
      if (r.status === 200) {
        const base = environment.apiBaseUrl?.replace(/\/$/, '');
        this.produtos = (r.data as any[]).map((p: any) => {
          let img = p.imagem as string | null;
          if (img) img = img.startsWith('http') ? img : `${base}${img.startsWith('/') ? '' : '/'}${img}`;
          return { id: p.id, nome: p.nome, preco: Number(p.preco), imagem: img || undefined, favorito: false };
        });
      } else if (r.status === 401) {
        (await this.toast.create({ message: 'Faça login', duration: 2000})).present();
        this.nav.navigateRoot('/login');
      }
    } catch(e) { console.error(e); }
    finally { loading.dismiss(); }
  }

  selecionarCategoria(id: number|undefined) {
    this.categoriaSelecionada = id;
    this.carregarProdutos();
  }

  abrirDetalhe(produto: any) {
    this.nav.navigateForward(`/produto/${produto.id}`);
  }
}
