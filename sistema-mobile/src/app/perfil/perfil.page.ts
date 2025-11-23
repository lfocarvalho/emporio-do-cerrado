import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { HttpResponse } from '@capacitor/core';
import { addIcons } from 'ionicons';
import { logOutOutline, receiptOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, IonList, IonItem, IonLabel, IonButton, IonIcon, IonSpinner]
})
export class PerfilPage implements OnInit {
  autenticado = false;
  carregando = false;
  pedidos: any[] = [];
  erro?: string;

  constructor(private auth: AuthService, private api: ApiService) {
    addIcons({ logOutOutline, receiptOutline, personOutline });
  }

  async ngOnInit() {
    this.autenticado = await this.auth.isAuthenticated();
    if (this.autenticado) {
      this.carregarPedidos();
    }
  }

  async carregarPedidos() {
    this.carregando = true;
    this.erro = undefined;
    try {
      // Endpoint histórico (precisamos criar se não existir): /pedidos/api/historico/
  const r: HttpResponse = await this.api.get('/pedidos/api/historico/', {}, true);
      if (r.status === 200) {
        this.pedidos = (r.data as any[])?.map(p => ({
          id: p.id,
          status: p.status,
          data_criacao: p.data_criacao,
          subtotal: p.subtotal
        })) || [];
      } else if (r.status === 401) {
        this.autenticado = false;
      } else {
        this.erro = 'Falha ao carregar pedidos: ' + r.status;
      }
    } catch (e:any) {
      this.erro = 'Erro de rede';
    } finally {
      this.carregando = false;
    }
  }

  async logout() {
    await this.auth.logout();
    this.autenticado = false;
    this.pedidos = [];
  }

  loginRedirect() {
    // Navegação simples
    location.href = '/login';
  }

}
