import pytest

from department.serializers import DepartmentSerializer


@pytest.mark.django_db
def test_department_serializer(department, manager_employee):
    department.manager = manager_employee
    department.save()

    serializer = DepartmentSerializer(department, context={"request": None})
    data = serializer.data

    assert data["name"] == department.name
    assert data["manager"] == f"/api/v1/employees/{manager_employee.pk}/"
    assert data["description"] == department.description
