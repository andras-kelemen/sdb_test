from django.core.exceptions import ValidationError
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    manager = models.OneToOneField(
        "employee.Employee", on_delete=models.SET_NULL, related_name="manages_department", null=True, blank=True
    )
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    def clean(self):
        super().clean()
        if self.manager and not self.manager.is_manager:
            raise ValidationError({"manager": "The chosen Employee is not Manager."})
