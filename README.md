# 🌾 Empório do Cerrado

Plataforma de e-commerce desenvolvida em **Django** para venda de produtos, com vitrine de produtos, carrinho de compras, gerenciamento de estoque e uma API REST para integração externa.

## 📋 Sobre o projeto

O **Empório do Cerrado** é um sistema web de loja virtual que permite aos visitantes navegar por categorias e produtos, montar um carrinho de compras e finalizar pedidos. Usuários com permissão de equipe (*staff*) têm acesso a um painel de gerenciamento para controlar o estoque de produtos e o carrossel de banners exibido na página inicial.

## ✨ Funcionalidades

**Vitrine de produtos**
- Página inicial com carrossel de banners e produtos em destaque
- Listagem de produtos com busca por nome/descrição e filtro por categoria
- Página de detalhe de cada produto

**Carrinho e pedidos**
- Adição e remoção de itens no carrinho (vinculado ao usuário logado)
- Cálculo automático do subtotal
- Finalização do pedido (o carrinho muda de status para "realizado")
- Histórico de pedidos do usuário

**Autenticação**
- Cadastro, login e logout via sessão
- Página de perfil do usuário
- Endpoint de login via API que retorna um token (DRF Token Authentication)

**Painel de gerenciamento** (restrito a usuários *staff*)
- CRUD completo de produtos e categorias
- CRUD dos itens do carrossel da home

**API REST**
- Endpoint autenticado por token para listagem de produtos, útil para integração com outros sistemas ou um frontend separado

## 🛠️ Tecnologias utilizadas

- **Python 3.12**
- **Django 5.2.6**
- **Django REST Framework** (API e autenticação por token)
- **django-cors-headers**
- **SQLite3** (banco de dados padrão de desenvolvimento)
- **Pillow** (necessário para upload de imagens via `ImageField`)
- **Tailwind CSS** (via CDN), **Google Fonts (Work Sans)** e **Material Symbols** no frontend (templates Django)

## 📁 Estrutura do projeto

```
emporio-do-cerrado/
├── core/                     # Gerenciamento do carrossel da home
├── produto/                  # Catálogo: categorias, produtos, busca e API
├── pedido/                   # Carrinho de compras e histórico de pedidos
├── sistema/                  # Configurações do projeto, autenticação e login via API
├── templates/                # Templates HTML (base, produto, pedido, core, autenticação)
├── static/imagens/           # Arquivos estáticos (logo)
├── media/carrossel_imagens/  # Imagens enviadas para o carrossel
├── db.sqlite3
└── manage.py
```

## 🚀 Como executar localmente

```bash
# 1. Clone o repositório
git clone https://github.com/lfocarvalho/emporio-do-cerrado.git
cd emporio-do-cerrado

# 2. Crie e ative um ambiente virtual
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Linux/Mac

# 3. Instale as dependências
pip install django djangorestframework django-cors-headers pillow

# 4. Aplique as migrações
python manage.py migrate

# 5. (Opcional) Crie um usuário administrador
python manage.py createsuperuser

# 6. Inicie o servidor de desenvolvimento
python manage.py runserver
```

Depois disso, acesse `http://127.0.0.1:8000/` no navegador. O painel administrativo do Django fica em `/admin/`.

## 👤 Autor

Desenvolvido por [lfocarvalho](https://github.com/lfocarvalho).

