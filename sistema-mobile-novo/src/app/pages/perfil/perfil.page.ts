import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonList,
  IonItem, IonLabel, IonIcon, IonButton, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, personOutline, mailOutline, logOut } from 'ionicons/icons';
import { AuthService, User } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonList,
    IonItem, IonLabel, IonIcon, IonButton, IonNote, CommonModule
  ]
})
export class PerfilPage implements OnInit {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  user: User | null = null;
  pedidos: Array<{ id: number; status: string; data_criacao: string | null; subtotal: number }> = [];

  constructor() {
    addIcons({ personCircle, personOutline, mailOutline, logOut });
  }

  async ngOnInit() {
    this.user = await this.authService.getUser();
    await this.loadPedidos();
  }

  ionViewWillEnter() {
    // Atualiza a lista sempre que a aba for focada/aberta
    this.loadPedidos();
  }

  async loadPedidos() {
    try {
      const res = await this.apiService.get<any[]>('/pedidos/api/historico/');
      this.pedidos = (res || []).map((p: any) => ({
        id: p.id,
        status: p.status,
        data_criacao: p.data_criacao || null,
        subtotal: Number(p.subtotal || 0)
      }));
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  }

  async onLogout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  openPedido(id: number) {
    this.router.navigate(['/pedido', id]);
  }
}
