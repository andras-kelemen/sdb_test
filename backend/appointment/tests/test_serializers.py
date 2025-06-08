from datetime import datetime, timedelta

import pytest

from appointment.models import Appointment
from appointment.serializers import AppointmentReadSerializer, AppointmentWriteSerializer


@pytest.mark.django_db
def test_write_serializer_validation(employee):
    data = {
        "start_datetime": "2025-06-07T10:00:00Z",
        "end_datetime": "2025-06-07T11:00:00Z",
        "title": "Serializer Test",
        "employee": f"http://testserver/api/v1/employees/{employee.pk}/",
        "participants": [],
    }
    serializer = AppointmentWriteSerializer(data=data)
    assert serializer.is_valid(), serializer.errors
    instance = serializer.save()

    assert instance.title == "Serializer Test"


@pytest.mark.django_db
def test_read_serializer_output(employee):
    appointment = Appointment.objects.create(
        start_datetime=datetime.now(),
        end_datetime=datetime.now() + timedelta(hours=1),
        title="Read Test",
        employee=employee,
    )
    serializer = AppointmentReadSerializer(appointment, context={"request": None})
    data = serializer.data
    assert data["title"] == "Read Test"
    assert "employee" in data
