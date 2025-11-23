import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton } from '@ionic/angular/standalone';
import { NavController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-carrinho',
  templateUrl: './carrinho.page.html',
  styleUrls: ['./carrinho.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButton],
  providers: [Storage]
})
export class CarrinhoPage implements OnInit {
  itens: Array<any> = [];
  subtotal: string = '0';

  constructor(
    private storage: Storage,
    private nav: NavController,
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

  async carregar() {
    const t = await this.token();
    if (!t) { (await this.toast.create({ message: 'Faça login', duration: 2000})).present(); this.nav.navigateRoot('/login'); return; }
    const r = await this.api.get('/pedidos/api/carrinho/');
    if (r.status === 200) { this.itens = r.data.itens; this.subtotal = r.data.subtotal; }
  }

  async alterar(item: any, quantidade: number) {
    const t = await this.token();
    if (!t) return;
    const r = await this.api.post('/pedidos/api/alterar/', { item_id: item.id, quantidade });
    if (r.status === 200) await this.carregar();
  }

  async remover(item: any) {
    const t = await this.token();
    if (!t) return;
    const r = await this.api.post('/pedidos/api/remover/', { item_id: item.id });
    if (r.status === 200) await this.carregar();
  }

  async finalizar() {
    const t = await this.token();
    if (!t) return;
    const r = await this.api.post('/pedidos/api/finalizar/', {});
    if (r.status === 200) {
      (await this.toast.create({ message: 'Pedido finalizado!', duration: 2000 })).present();
  this.nav.navigateRoot('/tabs/home');
    }
  }
}
