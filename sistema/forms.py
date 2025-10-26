# mercado/sistema/forms.py

from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        # Você pode adicionar mais campos aqui se quiser, como 'email' ou 'first_name'
        fields = UserCreationForm.Meta.fields + ('email',)