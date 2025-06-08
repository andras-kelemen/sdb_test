from django.db import models

from employee.models import Employee


class Appointment(models.Model):
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name="appointments", null=True)
    participants = models.ManyToManyField(Employee, related_name="participants", blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.start_datetime} - {self.end_datetime})"

    class Meta:
        ordering = ["start_datetime"]
        constraints = [
            models.CheckConstraint(check=models.Q(end_datetime__gt=models.F("start_datetime")), name="end_after_start")
        ]
