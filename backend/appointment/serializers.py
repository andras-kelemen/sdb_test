from rest_framework import serializers

from employee.models import Employee
from employee.serializers import EmployeeSerializer

from .models import Appointment


class AppointmentReadSerializer(serializers.HyperlinkedModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name="appointment-detail", lookup_field="pk")
    employee = EmployeeSerializer(many=False)
    participants = EmployeeSerializer(many=True)

    class Meta:
        model = Appointment
        fields = (
            "url",
            "id",
            "start_datetime",
            "end_datetime",
            "title",
            "description",
            "employee",
            "participants",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class AppointmentWriteSerializer(serializers.HyperlinkedModelSerializer):
    participants = serializers.HyperlinkedRelatedField(
        many=True, queryset=Employee.objects.all(), view_name="employee-detail", lookup_field="pk"
    )
    employee = serializers.HyperlinkedRelatedField(
        many=False, queryset=Employee.objects.all(), view_name="employee-detail", lookup_field="pk"
    )

    class Meta:
        model = Appointment
        fields = ("start_datetime", "end_datetime", "title", "employee", "participants")
