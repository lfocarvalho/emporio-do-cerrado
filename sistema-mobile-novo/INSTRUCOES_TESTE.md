# Instruções para Testar o App Mobile

## 1. Iniciar o Backend Django

Em um terminal separado, execute:

```bash
cd /home/luiz-fernando/Documentos/GitHub/emporio-do-cerrado
python manage.py runserver
```

O Django deve estar rodando em `http://localhost:8000`

## 2. Verificar se a API está respondendo

Teste os endpoints principais:

```bash
# Testar categorias
curl http://localhost:8000/produtos/api/categorias/

# Testar produtos
curl http://localhost:8000/produtos/api/

# Testar autenticação (deve retornar erro sem credenciais)
curl -X POST http://localhost:8000/autenticacao-api/ \
  -H "Content-Type: application/json" \
  -d '{"username":"seu_usuario","password":"sua_senha"}'
```

## 3. Como Usar o App

### Fluxo Principal:

1. **Página de Login** (inicial)
   - Digite seu usuário e senha do Django
   - Clique em "Entrar"
   - Se sucesso, será redirecionado para /tabs/home

2. **Home (Aba Início)**
   - Ver categorias (ex: Açougue, Hortifruti, etc)
   - Clicar em uma categoria → vai para aba Produtos com filtro
   - Ver produtos recentes
   - Clicar em um produto → vai para detalhes

3. **Produtos (Aba Grid)**
   - Ver lista completa de produtos
   - Usar busca para filtrar
   - Clicar em produto → detalhes

4. **Favoritos (Aba Coração)**
   - Ver produtos marcados como favoritos
   - Deslizar para remover

5. **Carrinho (Aba Cart)**
   - Ver itens adicionados
   - Ver total
   - Remover itens

6. **Perfil (Aba Person)**
   - Ver dados do usuário
   - Botão de logout

## 4. Debug

Abra o Console do Navegador (F12) e verifique os logs:
- "Carregando categorias..."
- "Categorias carregadas: [...]"
- "API Request: GET /produtos/api/categorias/"
- "API Response: 200 [...]"

## 5. Problemas Comuns

### Tela branca ou erros:
- Verifique se o Django está rodando
- Verifique o console do navegador (F12)
- Verifique os logs do terminal do ng serve

### Categorias não aparecem:
- Django não está rodando
- Endpoint `/produtos/api/categorias/` não existe ou retorna erro
- Problema de CORS (o proxy deve resolver)

### Click não funciona:
- Verifique console do navegador
- Deve aparecer log "Navegando para categoria: X"
- Se não aparecer, há problema no evento de click

### Navegação não muda de página:
- Problema nas rotas do Angular
- Verifique se a rota existe em app.routes.ts
