from django.contrib import admin

from .models import Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "manager", "description")
    search_fields = ("name", "description")
    list_select_related = ("manager",)
