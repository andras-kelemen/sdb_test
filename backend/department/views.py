from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from employee.models import Employee
from employee.serializers import EmployeeSerializer

from .models import Department
from .serializers import DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.select_related("manager").all()
    serializer_class = DepartmentSerializer

    @action(detail=True, methods=["get"])
    def employees(self, request, pk=None):
        department = self.get_object()
        employees = Employee.objects.filter(department=department).select_related("department")
        serializer = EmployeeSerializer(employees, many=True, context={"request": request})
        return Response(serializer.data)
