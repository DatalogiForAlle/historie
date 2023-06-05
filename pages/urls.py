from django.urls import path

from .views import HomePageView, ChartView

urlpatterns = [
    path("", HomePageView.as_view(), name="home"),
    # path("chart/", ChartView.as_view(), name="chart"),
]
