from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from .models import Produto, Categoria
from .forms import FormularioProduto


class TestesModelProduto(TestCase):
	"""
	Testes para o model Produto
	"""

	def test_str_retorna_nome(self):
		p = Produto.objects.create(nome='Café do Cerrado', preco=10.50)
		self.assertEqual(str(p), 'Café do Cerrado')

	def test_estoque_padrao_zero(self):
		p = Produto.objects.create(nome='Rapadura', preco=5.00)
		self.assertEqual(p.estoque, 0)


class TestesViewListarProdutos(TestCase):
	"""
	Testes para a view ListarProdutos
	"""

	def setUp(self):
		self.url = reverse('produtos:listar-produtos')
		cat = Categoria.objects.create(nome='Bebidas')
		Produto.objects.create(nome='Café', preco=12.00, categoria=cat)

	def test_get(self):
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)
		# context_object_name = 'lista_produtos' e também existe 'object_list'
		self.assertIn('lista_produtos', response.context)
		# Usa object_list para ser agnóstico à paginação
		self.assertEqual(len(response.context['object_list']), 1)

	def test_filtro_por_categoria(self):
		# Cria outro produto em categoria diferente
		outra_cat = Categoria.objects.create(nome='Doces')
		Produto.objects.create(nome='Doce de Leite', preco=20.0, categoria=outra_cat)
		response = self.client.get(self.url, { 'categoria': 'Bebidas'})
		self.assertEqual(response.status_code, 200)
		produtos = list(response.context['object_list'])
		self.assertTrue(all(p.categoria.nome == 'Bebidas' for p in produtos))


class TestesViewCriarProduto(TestCase):
	"""
	Testes para a view CriarProduto (rota protegida para staff)
	"""

	def setUp(self):
		self.user = User.objects.create_user(username='admin', password='12345', is_staff=True)
		self.client.force_login(self.user)
		self.url = reverse('produtos:criar-produto')

	def test_get(self):
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)
		self.assertIsInstance(response.context.get('form'), FormularioProduto)

	def test_post(self):
		dados = {
			'nome': 'Castanha de Baru',
			'preco': '35.90',
			'descricao': 'Sabor do cerrado',
			'estoque': 10,
		}
		response = self.client.post(self.url, dados)
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('produtos:gerenciar-estoque'))
		self.assertEqual(Produto.objects.count(), 1)
		p = Produto.objects.first()
		self.assertEqual(p.nome, 'Castanha de Baru')
		self.assertEqual(float(p.preco), 35.90)
		self.assertEqual(p.estoque, 10)


class TestesViewEditarProduto(TestCase):
	"""
	Testes para a view EditarProduto (rota protegida para staff)
	"""

	def setUp(self):
		self.user = User.objects.create_user(username='admin', password='12345', is_staff=True)
		self.client.force_login(self.user)
		self.instancia = Produto.objects.create(nome='Mel do Cerrado', preco=25.00, estoque=3)
		self.url = reverse('produtos:editar-produto', kwargs={'pk': self.instancia.pk})

	def test_get(self):
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)
		self.assertIsInstance(response.context.get('object'), Produto)
		self.assertIsInstance(response.context.get('form'), FormularioProduto)
		self.assertEqual(response.context.get('object').pk, self.instancia.pk)

	def test_post(self):
		dados = {
			'nome': 'Mel Silvestre',
			'preco': '29.90',
			'descricao': 'Mel de flores do cerrado',
			'estoque': 5,
		}
		response = self.client.post(self.url, dados)
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('produtos:gerenciar-estoque'))
		# Recarrega do banco para ver alterações
		self.instancia.refresh_from_db()
		self.assertEqual(self.instancia.nome, 'Mel Silvestre')
		self.assertEqual(float(self.instancia.preco), 29.90)
		self.assertEqual(self.instancia.estoque, 5)


class TestesViewExcluirProduto(TestCase):
	"""
	Testes para a view ExcluirProduto (rota protegida para staff)
	"""

	def setUp(self):
		self.user = User.objects.create_user(username='admin', password='12345', is_staff=True)
		self.client.force_login(self.user)
		self.instancia = Produto.objects.create(nome='Farinha de Pequi', preco=15.00)
		self.url = reverse('produtos:excluir-produto', kwargs={'pk': self.instancia.pk})

	def test_get_confirmacao(self):
		# DeleteView normalmente exibe página de confirmação via GET
		response = self.client.get(self.url)
		self.assertEqual(response.status_code, 200)
		self.assertEqual(Produto.objects.count(), 1)

	def test_post_excluir(self):
		response = self.client.post(self.url)
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('produtos:gerenciar-estoque'))
		self.assertEqual(Produto.objects.count(), 0)
