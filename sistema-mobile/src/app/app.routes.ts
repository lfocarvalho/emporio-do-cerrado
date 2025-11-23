import { Routes } from '@angular/router';
import { TabsPage } from './tabs/tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      { path: 'home', loadComponent: () => import('./home/home.page').then(m => m.HomePage) },
      { path: 'produtos', loadComponent: () => import('./produtos/produtos.page').then(m => m.ProdutosPage) },
      { path: 'favoritos', loadComponent: () => import('./favoritos/favoritos.page').then(m => m.FavoritosPage) },
      { path: 'carrinho', loadComponent: () => import('./carrinho/carrinho.page').then(m => m.CarrinhoPage) },
      { path: 'perfil', loadComponent: () => import('./perfil/perfil.page').then(m => m.PerfilPage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  // Rota de login fora das tabs
  { path: 'login', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },
  { path: '', redirectTo: 'tabs/home', pathMatch: 'full' },
  { path: '**', redirectTo: 'tabs/home' }
];
