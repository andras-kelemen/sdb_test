from django.apps import AppConfig


class DepartmentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "department"

    def ready(self):
        pass
