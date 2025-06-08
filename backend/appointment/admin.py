from django.contrib import admin

from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ("title", "start_datetime", "end_datetime", "employee")
    list_filter = ("start_datetime",)
    search_fields = ("title", "employee")
    autocomplete_fields = ("employee", "participants")
    date_hierarchy = "start_datetime"
