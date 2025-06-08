from rest_framework import serializers

from .models import Department


class DepartmentSerializer(serializers.HyperlinkedModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name="department-detail", lookup_field="pk")

    class Meta:
        model = Department
        fields = ["url", "id", "name", "manager", "description"]
