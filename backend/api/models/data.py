# from django.db import models

from threading import Timer

class Games:
  def __init__(self):
    self.games = []
  def newGame(self, newGame):
    game = {
      'id': newGame['id'],
      'name': newGame['name'],
      'players': [newGame['player'], { 'id': 'dummy id', 'name': 'dummy player 2' }],
    }
    self.games = [game] + self.games
    return self.games
  def kill(self, deaths):
    self.games = [i for i in self.games if i['id'] not in deaths]

class Instructions:
  def __init__(self):
    self.instructions = []
  def fetchInstruction(self, game_id):
    ret = [i for i in self.instructions if i['game_id'] == game_id]
    return ret[0] if ret != [] else None
  def addInstruction(self, newInstruction):
    self.instructions = [i for i in self.instructions if i['game_id'] != newInstruction['game_id']] + [newInstruction]
    return newInstruction
  def kill(self, deaths):
    self.instructions = [i for i in self.instructions if i['game_id'] not in deaths]

class LiveGames:
  def __init__(self):
    self.live_games = []
  def birth(self, game_id):
    self.live_games.append({ 'game_id': game_id, 'life': 7 })
  def kill(self):
    dead_games = [i['game_id'] for i in self.live_games if i['life'] == 0]
    self.live_games = [{ 'game_id': i['game_id'], 'life': i['life'] - 1 } for i in self.live_games if i['life'] > 0]
    return dead_games
  def stayAlive(self, game_id):
    self.live_games = [{ 'game_id': i['game_id'], 'life': 7 } for i in self.live_games if i['game_id'] == game_id]
    return game_id


games = Games()
live_games = LiveGames()
instructions = Instructions()


def allGames():
  return games.games
def newGame(game):
  live_games.birth(game['id'])
  return games.newGame(game)

def fetchInstruction(game_id):
  return instructions.fetchInstruction(game_id)
def sendInstruction(newInstruction):
  return instructions.addInstruction(newInstruction)

def live():
  deaths = live_games.kill()
  instructions.kill(deaths)
  games.kill(deaths)
  Timer(1, live).start()
Timer(1, live).start()

def stayAlive(game_id):
  live_games.stayAlive(game_id)