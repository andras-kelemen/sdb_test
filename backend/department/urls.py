from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DepartmentViewSet

router = DefaultRouter()
router.register(r"departments", DepartmentViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
