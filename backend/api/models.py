from django.db import models
import uuid
# Create your models here.

class Games:
  def __init__(self):
    self.games = []
  def newGame(self, name, player):
    game = {
      'id': uuid.uuid4(),
      'name': name,
      'players': [player],
    }
    self.games.append(game)
    return self.games
games = Games()

def allGames():
  return games.games
def newGame(name, player):
  return games.newGame(name, player)
