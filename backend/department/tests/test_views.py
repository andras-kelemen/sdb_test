import pytest
from rest_framework import status


@pytest.mark.django_db
def test_department_viewset_employees_endpoint(api_client, department, employee, manager_employee):
    # Assign the employee to the department
    employee.department = department
    employee.save()

    # Make a GET request to the employees custom action endpoint
    response = api_client.get(f"/api/v1/departments/{department.pk}/employees/")

    assert response.status_code == status.HTTP_200_OK

    response_data = response.json()
    # Check the employee is in the response
    assert any(e["id"] == employee.id for e in response_data)
    # Check the manager is not included if not assigned to this department
    assert all(e["id"] != manager_employee.id for e in response_data)
