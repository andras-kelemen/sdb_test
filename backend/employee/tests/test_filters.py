import pytest

from employee.filters import EmployeeFilter
from employee.models import Employee


@pytest.mark.django_db
def test_employee_filter_email_and_name(department):
    Employee.objects.create(
        name="Bob Smith", email="bob@example.com", position=Employee.POSITION_EMPLOYEE, department=department
    )
    Employee.objects.create(
        name="Bob Manager", email="bob.manager@example.com", position=Employee.POSITION_MANAGER, department=department
    )
    Employee.objects.create(
        name="Alice Johnson", email="alice@example.com", position=Employee.POSITION_EMPLOYEE, department=department
    )

    qs = Employee.objects.all()
    filter_email = EmployeeFilter({"email": "bob"}, queryset=qs)
    assert filter_email.qs.count() == 2

    filter_name = EmployeeFilter({"name": "alice"}, queryset=qs)
    assert filter_name.qs.count() == 1
    assert filter_name.qs.first().name == "Alice Johnson"
