from datetime import datetime, time

import django_filters
from django.utils import timezone

from .models import Appointment


class AppointmentFilter(django_filters.FilterSet):
    date = django_filters.DateFilter(method="filter_by_date")

    class Meta:
        model = Appointment
        fields = ["date"]

    def filter_by_date(self, queryset, name, value):
        start_of_day = timezone.make_aware(datetime.combine(value, time.min))
        end_of_day = timezone.make_aware(datetime.combine(value, time.max))

        return queryset.filter(start_datetime__lte=end_of_day, end_datetime__gte=start_of_day)
