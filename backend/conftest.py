import pytest
from django.utils import timezone
from rest_framework.test import APIClient

from appointment.models import Appointment
from department.models import Department
from employee.models import Employee


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def department():
    return Department.objects.create(name="IT Department")


@pytest.fixture
def employee():
    return Employee.objects.create(name="John Doe", email="johndoe@testmail.com")


@pytest.fixture
def manager_employee():
    return Employee.objects.create(
        name="Jane Smith", email="janesmith@testmail.com", position=Employee.POSITION_MANAGER
    )


@pytest.fixture
def employee_with_department(department):
    return Employee.objects.create(name="Steve Jobs", email="stevejobs@apple.com", department=department)


@pytest.fixture
def appointment(employee):
    return Appointment.objects.create(
        start_datetime=timezone.now(),
        end_datetime=timezone.now() + timezone.timedelta(hours=1),
        title="Test Appointment",
        employee=employee,
    )
