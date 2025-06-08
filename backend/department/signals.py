from django.db.models.signals import post_save
from django.dispatch import receiver

from department.models import Department


@receiver(post_save, sender=Department)
def ensure_manager_is_in_own_department(sender, instance, **kwargs):
    if manager := instance.manager:
        manager.department = instance
        manager.save()
