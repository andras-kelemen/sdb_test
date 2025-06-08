import pytest
from django.core.exceptions import ValidationError

from department.models import Department


@pytest.mark.django_db
def test_department_manager_must_be_manager(manager_employee, employee):
    # Valid case - the assigned manager is actually a manager
    dept = Department(name="IT", manager=manager_employee)
    dept.full_clean()  # should not raise any error

    # Invalid case - the assigned manager is not in manager position
    dept_wrong = Department(name="HR", manager=employee)
    with pytest.raises(ValidationError) as exc_info:
        dept_wrong.full_clean()
    # Check that the validation error contains the 'manager' field
    assert "manager" in exc_info.value.message_dict
    # Verify the exact error message
    assert exc_info.value.message_dict["manager"] == ["The chosen Employee is not Manager."]
