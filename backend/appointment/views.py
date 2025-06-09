from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .filters import AppointmentFilter
from .models import Appointment
from .serializers import AppointmentReadSerializer, AppointmentWriteSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.select_related("employee").prefetch_related("participants")
    filter_backends = [DjangoFilterBackend]
    filterset_class = AppointmentFilter
    _saved_instance = None

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return AppointmentReadSerializer
        return AppointmentWriteSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        self._saved_instance = instance

    def perform_update(self, serializer):
        instance = serializer.save()
        self._saved_instance = instance

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)
        read_serializer = AppointmentReadSerializer(self._saved_instance, context={"request": request})
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        super().update(request, *args, **kwargs)
        read_serializer = AppointmentReadSerializer(self._saved_instance, context={"request": request})
        return Response(read_serializer.data)

    @action(detail=False, methods=["get"], url_path="closest")
    def closest(self, request):
        """
        Return the nearest future Appointment.
        """

        result = (
            Appointment.objects.select_related("employee")
            .prefetch_related("participants")
            .filter(end_datetime__gte=timezone.now())
            .order_by("start_datetime")
            .first()
        )

        if result:
            serializer = AppointmentReadSerializer(result, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"detail": "No future appointments found."}, status=status.HTTP_404_NOT_FOUND)
