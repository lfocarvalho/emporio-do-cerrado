import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage) },
      { path: 'produtos', loadComponent: () => import('./pages/produtos/produtos.page').then(m => m.ProdutosPage) },
      { path: 'favoritos', loadComponent: () => import('./pages/favoritos/favoritos.page').then(m => m.FavoritosPage) },
      { path: 'carrinho', loadComponent: () => import('./pages/carrinho/carrinho.page').then(m => m.CarrinhoPage) },
      { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage) },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: 'produto/:id', loadComponent: () => import('./pages/produto-detalhe/produto-detalhe.page').then(m => m.ProdutoDetalhePage) },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
