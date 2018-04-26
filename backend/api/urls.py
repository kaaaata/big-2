# file: api/urls.py

from django.urls import path

from . import routes

urlpatterns = [
  path('', routes.index, name='index'),
  path('test/', routes.test, name='test')
]
