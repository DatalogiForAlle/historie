from django.urls import path, re_path

from .views import (
    CustomCSVViews,
    SearchResultsListView,
    SqlSearchResultsListView,
    # SearchView,
    index,
    # FinalSearch,
)

urlpatterns = [
    path("", SearchResultsListView.as_view(), name="search_results"),
    path("csv/", CustomCSVViews.as_view(), name="custom-csv-view"),
    path("sql/", SqlSearchResultsListView.as_view(), name="sql_search_results"),
    # path("search/", SearchView.as_view(), name="search"),
    # path("search/", SearchView.as_view(), name="search"),
    path("search/", index, name="index"),
    # path("search/", FinalSearch.as_view(), name="final_search"),
]
