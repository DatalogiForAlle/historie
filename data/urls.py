from django.urls import path

from .views import CustomCSVViews, SearchResultsListView

urlpatterns = [
    path("", SearchResultsListView.as_view(), name="search_results"),
    path("csv/", CustomCSVViews.as_view(), name="custom-csv-view"),
]
