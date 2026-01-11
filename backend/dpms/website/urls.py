from django.urls import path
from . import views

app_name = 'website'

urlpatterns = [
    path('', views.index, name='index'),
    path('editions/', views.editions_list, name='editions'),
]
