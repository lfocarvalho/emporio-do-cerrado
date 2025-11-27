from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "email"]
        read_only_fields = ["id"]

    def validate_username(self, value: str):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("O nome de usuário deve ter ao menos 3 caracteres.")
        # Garante unicidade exceto o próprio usuário
        qs = User.objects.filter(username__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Este nome de usuário já está em uso.")
        return value
