import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage-angular';
import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@capacitor/core';
import { IonContent, LoadingController, NavController, AlertController, ToastController, IonList, IonItem, IonInput, IonButton } from '@ionic/angular/standalone';
import { Usuario } from './usuario.model';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonInput, IonButton, IonContent, FormsModule],
  providers: [Storage]
})
export class LoginPage implements OnInit {

  constructor(
    public controle_carregamento: LoadingController,
    public controle_navegacao: NavController,
    public controle_alerta: AlertController,
    public controle_toast: ToastController,
    public storage: Storage,
    private auth: AuthService,
  ) { }

  async ngOnInit() {
    await this.storage.create();
  }

  public instancia: { username: string, password: string } = {
    username: '',
    password: ''
  };

  async autenticarUsuario() {

    if (!this.instancia.username?.trim() || !this.instancia.password?.trim()) {
      (await this.controle_toast.create({
        message: 'Informe usuário e senha.',
        duration: 2000
      })).present();
      return;
    }

    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({message: 'Autenticando...', duration: 15000});
    await loading.present();

    try {
      await this.auth.login(this.instancia.username, this.instancia.password);
      loading.dismiss();
      this.controle_navegacao.navigateRoot('/tabs/home');
    } catch (erro: any) {
      loading.dismiss();
      const code = erro?.status || 0;
      const msg = code === 400 ? 'Usuário ou senha inválidos.' : (code === 0 ? 'Sem conexão com a API. Verifique a rede.' : `Falha ao autenticar: código ${code}`);
      (await this.controle_toast.create({ message: msg, duration: 2000, cssClass: 'ion-text-center' })).present();
    }
  }

  async apresenta_mensagem(codigo: number) {
    const mensagem = await this.controle_toast.create({
      message: `Falha ao autenticar usuário: código ${codigo}`,
      cssClass: 'ion-text-center',
      duration: 2000
    });
    mensagem.present();
  }
}