import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonCard, IonCardContent, IonItem, IonLabel, 
  IonInput, IonButton, IonSpinner, IonText, IonIcon 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { storefrontOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonSpinner, IonText, IonIcon,
    CommonModule, FormsModule
  ]
})
export class LoginPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor() {
    addIcons({ storefrontOutline });
  }

  async ngOnInit() {
    // Se já estiver autenticado, redireciona para home
    const isAuth = await this.authService.isAuthenticated();
    if (isAuth) {
      this.router.navigate(['/tabs/home']);
    }
  }

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.username, this.password);
      this.router.navigate(['/tabs/home']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Erro ao fazer login';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
