import pytest

from employee.models import Employee


@pytest.mark.django_db
def test_employee_str_and_is_manager(department):
    employee = Employee.objects.create(
        name="John Doe",
        email="john@example.com",
        position=Employee.POSITION_EMPLOYEE,
        department=department,
    )
    manager = Employee.objects.create(
        name="Jane Manager",
        email="jane@example.com",
        position=Employee.POSITION_MANAGER,
        department=department,
    )

    assert str(employee) == "John Doe (employee)"
    assert str(manager) == "Jane Manager (manager)"

    assert employee.is_manager is False
    assert manager.is_manager is True
