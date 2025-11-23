from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token


class Command(BaseCommand):
    help = "Cria (se necessário) um usuário de demonstração e exibe o token de autenticação.\n" \
           "Use para testes rápidos do app mobile."

    def add_arguments(self, parser):
        parser.add_argument('--username', default='demo', help='Username do usuário demo (default: demo)')
        parser.add_argument('--password', default='demo123', help='Senha do usuário demo (default: demo123)')
        parser.add_argument('--email', default='demo@example.com', help='Email opcional')

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        password = options['password']
        email = options['email']

        user, created = User.objects.get_or_create(username=username, defaults={'email': email})
        if created:
            user.set_password(password)
            user.first_name = 'Demo'
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Usuário criado: {username}'))
        else:
            # garante que a senha corresponde ao que foi passado
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.WARNING(f'Usuário já existia. Senha redefinida para {password}.'))

        token, _ = Token.objects.get_or_create(user=user)
        self.stdout.write('Credenciais de teste:')
        self.stdout.write(f'  username: {username}')
        self.stdout.write(f'  password: {password}')
        self.stdout.write(f'  token: {token.key}')
        self.stdout.write('\nExemplo de requisição curl para login:')
        self.stdout.write(f"  curl -X POST http://localhost:8000/autenticacao-api/ -H 'Content-Type: application/json' -d '{{\"username\":\"{username}\",\"password\":\"{password}\"}}'")