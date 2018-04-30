from django.urls import path

from . import routes

urlpatterns = [
  # models/data.py
  path('allGames/', routes.allGames, name='allGames'),
  path('newGame/', routes.newGame, name='newGame'),
  path('joinGame/', routes.joinGame, name='joinGame'),

  path('fetchInstruction/', routes.fetchInstruction, name='fetchInstruction'),
  path('sendInstruction/', routes.sendInstruction, name='sendInstruction'),

  path('stayAlive/', routes.stayAlive, name='stayAlive'),

  # models/gameplay.py
  path('validPlay/', routes.validPlay, name='validPlay'),

  # models/ai.py
  path('selectBestHandToPlay/', routes.selectBestHandToPlay, name='selectBestHandToPlay')
]
