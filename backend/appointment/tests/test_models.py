from datetime import datetime, timedelta

import pytest
from django.core.exceptions import ValidationError

from appointment.models import Appointment


@pytest.mark.django_db
def test_appointment_str_and_constraints(employee):
    start = datetime.now()
    end = start + timedelta(hours=1)
    appointment = Appointment(
        start_datetime=start,
        end_datetime=end,
        title="Test Meeting",
        employee=employee,
    )
    appointment.full_clean()
    appointment.save()

    assert str(appointment) == f"Test Meeting ({start} - {end})"

    invalid_appointment = Appointment(
        start_datetime=start,
        end_datetime=start - timedelta(minutes=10),
        title="Bad Meeting",
        employee=employee,
    )
    with pytest.raises(ValidationError):
        invalid_appointment.full_clean()
