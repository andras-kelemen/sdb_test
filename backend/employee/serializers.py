from rest_framework import serializers

from department.serializers import DepartmentSerializer

from .models import Employee


class EmployeeSerializer(serializers.HyperlinkedModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name="employee-detail", lookup_field="pk")
    department = DepartmentSerializer(many=False, read_only=True)

    class Meta:
        model = Employee
        fields = (
            "url",
            "id",
            "name",
            "email",
            "position",
            "department",
        )
        read_only_fields = ("id",)
