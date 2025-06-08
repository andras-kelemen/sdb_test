from datetime import timedelta

import pytest
from django.utils import timezone
from rest_framework import status

from appointment.models import Appointment


@pytest.mark.django_db
def test_appointment_list_and_create(api_client, employee):
    # Test listing appointments (should be empty initially)
    response = api_client.get("/api/v1/appointments/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list) or "results" in data

    # Test creating a new appointment via POST
    data = {
        "start_datetime": "2025-06-07T10:00:00Z",
        "end_datetime": "2025-06-07T11:00:00Z",
        "title": "API Test",
        "employee": f"http://testserver/api/v1/employees/{employee.pk}/",
        "participants": [],
    }
    response = api_client.post("/api/v1/appointments/", data, format="json")
    assert response.status_code == status.HTTP_201_CREATED
    assert response.json()["title"] == "API Test"


@pytest.mark.django_db
def test_appointment_retrieve_and_update(api_client, appointment):
    url = f"/api/v1/appointments/{appointment.pk}/"

    # Test retrieving the appointment by ID
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == appointment.title

    # Test updating the appointment title with PATCH
    data = {"title": "Updated Title"}
    response = api_client.patch(url, data, format="json")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["title"] == "Updated Title"


@pytest.mark.django_db
def test_appointment_closest(api_client, employee):
    now = timezone.now()

    # Test that when no future appointments exist, API returns 404
    response = api_client.get("/api/v1/appointments/closest/")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "No future appointments found."

    # Create a past appointment (should not be considered is the closest future)
    Appointment.objects.create(
        start_datetime=now - timedelta(days=2),
        end_datetime=now - timedelta(days=1, hours=23),
        title="Past Appointment",
        employee=employee,
    )

    # Create a future appointment (should be returned as closest)
    future_appointment = Appointment.objects.create(
        start_datetime=now + timedelta(hours=1),
        end_datetime=now + timedelta(hours=2),
        title="Future Appointment",
        employee=employee,
    )

    # Test that the closest future appointment is returned correctly
    response = api_client.get("/api/v1/appointments/closest/")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Future Appointment"
    assert data["id"] == future_appointment.id
