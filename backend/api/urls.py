from django.urls import path

from . import routes

urlpatterns = [
  # models/data.py
  path('allGames/', routes.allGames, name='allGames'),
  path('newGame/', routes.newGame, name='newGame'),

  path('fetchInstruction/', routes.fetchInstruction, name='fetchInstruction'),
  path('sendInstruction/', routes.sendInstruction, name='sendInstruction'),

  path('stayAlive/', routes.stayAlive, name='stayAlive')


  # models/gameplay.py
]
