from django.urls import path, re_path

from .views import (
    CustomCSVViews,
    SearchResultsListView,
    SqlSearchResultsListView,
    # SearchView,
    search,
    one_input_chart,
    two_input_chart,
    population_pyramid,
    aggregation_list,
    # infinite_scroll,
    # FinalSearch,
)

urlpatterns = [
    # path("", SearchResultsListView.as_view(), name="search_results"),
    # path("csv/", CustomCSVViews.as_view(), name="custom-csv-view"),
    # path("sql/", SqlSearchResultsListView.as_view(), name="sql_search_results"),
    # path("search/", SearchView.as_view(), name="search"),
    # path("search/", SearchView.as_view(), name="search"),
    path("", search, name="search"),
    # path("search/", FinalSearch.as_view(), name="final_search"),
    path("one_input_chart/", one_input_chart, name="one_input_chart"),
    path("two_input_chart/", two_input_chart, name="two_input_chart"),
    path("population_pyramid/", population_pyramid, name="population_pyramid"),
    path("aggregation_list/", aggregation_list, name="aggregation_list"),
    # path("infinite_scroll/", infinite_scroll, name="infinite_scroll"),
]

# urlpatterns = [
#     path("", SearchResultsListView.as_view(), name="search_results"),
#     path("csv/", CustomCSVViews.as_view(), name="custom-csv-view"),
#     path("sql/", SqlSearchResultsListView.as_view(), name="sql_search_results"),
#     # path("search/", SearchView.as_view(), name="search"),
#     # path("search/", SearchView.as_view(), name="search"),
#     path("search/", search, name="search"),
#     # path("search/", FinalSearch.as_view(), name="final_search"),
#     path("search/one_input_chart/", one_input_chart, name="one_input_chart"),
#     path("search/two_input_chart/", two_input_chart, name="two_input_chart"),
# ]
