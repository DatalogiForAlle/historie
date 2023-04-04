from django.urls import path, re_path

from .views import (
    CustomCSVViews,
    SearchResultsListView,
    SqlSearchResultsListView,
    # SearchView,
    search,
    pie_chart,
    # FinalSearch,
)

urlpatterns = [
    path("", SearchResultsListView.as_view(), name="search_results"),
    path("csv/", CustomCSVViews.as_view(), name="custom-csv-view"),
    path("sql/", SqlSearchResultsListView.as_view(), name="sql_search_results"),
    # path("search/", SearchView.as_view(), name="search"),
    # path("search/", SearchView.as_view(), name="search"),
    path("search/", search, name="search"),
    # path("search/", FinalSearch.as_view(), name="final_search"),
    path("search/pie_chart/", pie_chart, name="pie_chart")
]
