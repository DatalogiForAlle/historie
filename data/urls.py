from django.urls import path

from .views import CustomCSVViews

urlpatterns = [
    path("csv/", CustomCSVViews.as_view(), name="custom-csv-view"),
]
