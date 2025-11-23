import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg,
    IonGrid, IonRow, IonCol, IonIcon
  ],
  providers: [Storage]
})
export class FavoritosPage implements OnInit {
  produtos: Array<any> = [];

  constructor(
    private storage: Storage,
    private nav: NavController,
    private loading: LoadingController,
    private toast: ToastController,
    private api: ApiService,
    private auth: AuthService,
  ) {}

  async ngOnInit() {
    await this.storage.create();
    await this.carregar();
  }

  private async token() {
    return this.auth.getToken();
  }

  private resolveImagem(img?: string|null) {
    if (!img) return undefined;
    const base = environment.apiBaseUrl?.replace(/\/$/, '');
    return img.startsWith('http') ? img : `${base}${img.startsWith('/') ? '' : '/'}${img}`;
  }

  async carregar() {
    const t = await this.token();
    if (!t) { (await this.toast.create({ message: 'Faça login para ver favoritos', duration: 2000})).present(); this.nav.navigateRoot('/login'); return; }
    const loading = await this.loading.create({ message: 'Carregando favoritos...', duration: 10000 });
    await loading.present();
    try {
  const r = await this.api.get('/favoritos/api/');
      if (r.status === 200) {
        this.produtos = (r.data as any[]).map((p: any) => ({
          id: p.id,
          nome: p.nome,
          preco: Number(p.preco),
          imagem: this.resolveImagem(p.imagem),
        }));
      }
    } catch (e) { console.error(e); }
    finally { loading.dismiss(); }
  }

  async removerFavorito(produto: any) {
    const t = await this.token();
    if (!t) return;
    try {
  const r = await this.api.post('/favoritos/api/toggle/', { produto_id: produto.id });
      if (r.status === 200 && r.data?.is_favorited === false) {
        this.produtos = this.produtos.filter(p => p.id !== produto.id);
        (await this.toast.create({ message: 'Removido dos favoritos', duration: 1500 })).present();
      }
    } catch (e) { console.error(e); }
  }

  abrirProduto(produto: any) {
    this.nav.navigateForward(`/produto/${produto.id}`);
  }
}
