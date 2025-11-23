import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { HttpResponse } from '@capacitor/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-produto-detalhe',
  templateUrl: './produto-detalhe.page.html',
  styleUrls: ['./produto-detalhe.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent],
  providers: [Storage]
})
export class ProdutoDetalhePage implements OnInit {
  produto?: { id:number; nome:string; descricao?:string; preco:number; imagem?:string };

  constructor(
    private route: ActivatedRoute,
    private storage: Storage,
    private nav: NavController,
    private loading: LoadingController,
    private toast: ToastController,
    private api: ApiService,
    private auth: AuthService,
  ) {}

  async ngOnInit() {
    await this.storage.create();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    await this.carregar(id);
  }

  private async carregar(id:number) {
    const loading = await this.loading.create({ message: 'Carregando...', duration: 12000 });
    await loading.present();
    try {
      const r: HttpResponse = await this.api.get(`/produtos/api/${id}/`);
      if (r.status === 200) {
        const p: any = r.data;
        const base = environment.apiBaseUrl?.replace(/\/$/, '');
        let img = p.imagem as string | null;
        if (img) img = img.startsWith('http') ? img : `${base}${img.startsWith('/') ? '' : '/'}${img}`;
        this.produto = { id: p.id, nome: p.nome, descricao: p.descricao, preco: Number(p.preco), imagem: img || undefined };
      } else if (r.status === 404) {
        (await this.toast.create({ message: 'Produto não encontrado', duration: 2000 })).present();
        this.nav.back();
      }
    } catch(e) { console.error(e); }
    finally { loading.dismiss(); }
  }

  async adicionarAoCarrinho() {
    if (!this.produto) return;
    const token = await this.auth.getToken();
    if (!token) { (await this.toast.create({ message: 'Faça login', duration: 2000})).present(); this.nav.navigateRoot('/login'); return; }
    const r = await this.api.post('/pedidos/api/adicionar/', { produto_id: this.produto.id, quantidade: 1 });
    if (r.status === 200) (await this.toast.create({ message: 'Adicionado ao carrinho', duration: 1800})).present();
  }
}
