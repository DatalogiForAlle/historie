from django.urls import path

from .views import (
    search,
    one_input_chart,
    two_input_chart,
    population_pyramid,
    aggregation_list,
    county_map,
)

urlpatterns = [
    path("", search, name="search"),
    path("one_input_chart/", one_input_chart, name="one_input_chart"),
    path("two_input_chart/", two_input_chart, name="two_input_chart"),
    path("population_pyramid/", population_pyramid, name="population_pyramid"),
    path("aggregation_list/", aggregation_list, name="aggregation_list"),
    path("county_map/", county_map, name="county_map"),
]
