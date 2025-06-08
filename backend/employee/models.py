from django.core.exceptions import ValidationError
from django.db import models
from django.utils.translation import gettext_lazy as _


class Employee(models.Model):
    POSITION_EMPLOYEE = "employee"
    POSITION_MANAGER = "manager"

    POSITION_CHOICES = [
        (POSITION_EMPLOYEE, _("Employee")),
        (POSITION_MANAGER, _("Manager")),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    position = models.CharField(max_length=20, choices=POSITION_CHOICES, default=POSITION_EMPLOYEE)
    department = models.ForeignKey("department.Department", on_delete=models.SET_NULL, null=True, blank=False)

    def __str__(self):
        return f"{self.name} ({self.position})"

    def clean(self):
        super().clean()
        if not self.email:
            raise ValidationError({"email": "Email is mandatory."})

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    @property
    def is_manager(self):
        return self.position == self.POSITION_MANAGER
