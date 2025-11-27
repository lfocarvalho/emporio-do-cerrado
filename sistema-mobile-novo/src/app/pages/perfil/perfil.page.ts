import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonList,
  IonItem, IonLabel, IonIcon, IonButton, IonNote, IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personCircle, personOutline, mailOutline, logOut } from 'ionicons/icons';
import { AuthService, User } from '../../core/auth.service';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonAvatar, IonList,
    IonItem, IonLabel, IonIcon, IonButton, IonNote, IonInput, CommonModule, ReactiveFormsModule
  ]
})
export class PerfilPage implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  user: User | null = null;
  form: FormGroup;
  saving = false;
  toastMessage = '';
  pedidos: Array<{ id: number; status: string; data_criacao: string | null; subtotal: number }> = [];
  private refreshTimer?: any;
  private autosaveSub?: Subscription;
  private lastSavedSnapshot: { username?: string; first_name?: string; last_name?: string; email?: string } | null = null;
  private autosaving = false;

  constructor() {
    addIcons({ personCircle, personOutline, mailOutline, logOut });
    const fb = inject(FormBuilder);
    this.form = fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      first_name: ['', [Validators.maxLength(100)]],
      last_name: ['', [Validators.maxLength(100)]],
      email: ['', [Validators.email]],
    });
  }


  ionViewWillEnter() {
    // Atualiza pedidos e perfil ao focar
    this.loadPedidos();
    this.refreshUser();
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

  async saveProfile() {
    if (!this.form.valid) {
      this.toastMessage = 'Verifique os campos';
      return;
    }
    this.saving = true;
    try {
      const payload = this.form.value;
      const updated = await this.apiService.patch<User>('/perfil/api/', payload);
      this.user = updated;
      await this.authService.setUserData(updated);
      this.toastMessage = 'Dados salvos com sucesso';
    } catch (e: any) {
      console.error(e);
      this.toastMessage = e.message || 'Erro ao salvar';
    } finally {
      this.saving = false;
      setTimeout(() => { this.toastMessage = ''; }, 3000);
    }
  }

  async refreshUser() {
    try {
      const updated = await this.apiService.get<User>('/perfil/api/');
      this.user = updated;
      // Atualiza form sem perder edição em andamento se campo já modificado
      if (!this.form.dirty) {
        this.form.patchValue({
          username: updated.username || '',
          first_name: updated.first_name || '',
          last_name: updated.last_name || '',
          email: updated.email || ''
        });
      }
      await this.authService.setUserData(updated);
    } catch (e) {
      // silencioso para polling
    }
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    if (this.autosaveSub) {
      this.autosaveSub.unsubscribe();
    }
  }

  private startAutoRefresh() {
    // Polling leve a cada 60s. Pode ajustar conforme necessidade.
    this.refreshTimer = setInterval(() => this.refreshUser(), 60000);
  }

  async ngOnInit() {
    this.user = await this.authService.getUser();
    if (this.user) {
      this.form.patchValue({
        username: this.user.username || '',
        first_name: this.user.first_name || '',
        last_name: this.user.last_name || '',
        email: this.user.email || ''
      });
      this.lastSavedSnapshot = {
        username: this.user.username || '',
        first_name: this.user.first_name || '',
        last_name: this.user.last_name || '',
        email: this.user.email || ''
      };
    }
    await this.loadPedidos();
    this.startAutoRefresh();
    // Faz refresh inicial para garantir dados atuais
    this.refreshUser();
    this.setupAutoSave();
  }

  private setupAutoSave() {
    this.autosaveSub = this.form.valueChanges.pipe(debounceTime(800)).subscribe(async values => {
      if (!this.form.valid) return;
      // Verifica se mudou algo em relação ao snapshot
      const changed = !this.lastSavedSnapshot || ['username','first_name','last_name','email'].some(k => (values as any)[k] !== (this.lastSavedSnapshot as any)[k]);
      if (!changed) return;
      // Evita salvar enquanto já está salvando
      if (this.autosaving) return;
      this.autosaving = true;
      try {
        const updated = await this.apiService.patch<User>('/perfil/api/', {
          username: values.username || '',
          first_name: values.first_name || '',
          last_name: values.last_name || '',
          email: values.email || ''
        });
        this.user = updated;
        await this.authService.setUserData(updated);
        this.lastSavedSnapshot = {
          username: updated.username || '',
          first_name: updated.first_name || '',
          last_name: updated.last_name || '',
          email: updated.email || ''
        };
        this.toastMessage = 'Salvo automaticamente';
        setTimeout(() => { if (this.toastMessage === 'Salvo automaticamente') this.toastMessage = ''; }, 2000);
      } catch (e: any) {
        this.toastMessage = e.message || 'Erro ao salvar automaticamente';
        setTimeout(() => { if (this.toastMessage?.includes('automaticamente')) this.toastMessage = ''; }, 4000);
      } finally {
        this.autosaving = false;
      }
    });
  }
}
