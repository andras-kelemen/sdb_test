import pytest
from rest_framework.test import APIRequestFactory

from employee.models import Employee
from employee.serializers import EmployeeSerializer


@pytest.mark.django_db
def test_employee_serializer(employee_with_department, department):
    factory = APIRequestFactory()
    request = factory.get("/")

    serializer = EmployeeSerializer(employee_with_department, context={"request": request})
    data = serializer.data

    assert data["name"] == employee_with_department.name
    assert data["email"] == employee_with_department.email
    assert data["position"] == Employee.POSITION_EMPLOYEE
    assert data["department"]["name"] == department.name
