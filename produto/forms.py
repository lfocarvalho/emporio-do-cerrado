# produto/forms.py
from django.forms import ModelForm
from .models import Produto

class FormularioProduto(ModelForm):
    class Meta:
        model = Produto
        exclude = []