# data.py stores shared data on server for sharing with clients.

# from django.db import models
from threading import Timer
from random import shuffle
from . import gameplay

# a class to store all game data in memory
class Games:
  def __init__(self):
    self.games = []
    self.instructions = []
    self.startingLife = 3

  # self.games methods
  def newGame(self, newGame):
    # initialize a new game with one player in the p1 slot, returning the newly created game object
    # generate starting hands from randomized deck of big2ranks
    deck = gameplay.generateRandomDeck()

    game = {
      'id': newGame['id'],
      # all players and spectators have id, name, and life (representing whether they are active or not)
      'players': [
        { 'id': newGame['p1']['id'], 'name': newGame['p1']['name'], 'life': self.startingLife }, 
        # { 'id': 'dummy id', 'name': 'dummy player 2', 'life': self.startingLife }, # dummy player for development
      ],
      'p1_hand': deck[:18],
      'p2_hand': deck[18:36],
      'table': [],
      'spectators': []
    }

    if game['id'].startswith('HUMAN_VS_AI'):
      game['players'].append({ 'id': newGame['p2']['id'], 'name': newGame['p2']['name'], 'life': 999999999999 }) # need to refactor this eventually

    self.games = [game] + self.games
    return game
  def joinGame(self, gameInfo):
    # join a player into a game as a player, or if there is no room, as a spectator, returning the game object
    game_id = gameInfo['game_id']
    player = { 'id': gameInfo['player']['id'], 'name': gameInfo['player']['name'], 'life': self.startingLife }

    for i in range(len(self.games)):
      if self.games[i]['id'] == game_id:
        if len(self.games[i]['players']) == 1:
          self.games[i]['players'].append(player)
        else:
          self.games[i]['spectators'].append(player)
        return self.games[i]
  # decrease player life every 1s if life reaches 0, player is 'disconnected'. life resets to self.startingLife every 5s from client.
  def age(self):
    game_ids_to_delete = []
    for i in range(len(self.games)):
      for j in range(len(self.games[i]['players'])):
        self.games[i]['players'][j]['life'] -= 1
        if self.games[i]['players'][j]['life'] == 0:
          game_ids_to_delete.append(self.games[i]['id']) # probably should not delete the game right away but let's work on this later
      for j in range(len(self.games[i]['spectators'])):
        self.games[i]['spectators'][j]['life'] -= 1
        if self.games[i]['spectators'][j]['life'] == 0:
          del self.games[i]['spectators'][j]
    self.games = [i for i in self.games if i['id'] not in game_ids_to_delete]
    self.instructions = [i for i in self.instructions if i['game_id'] not in game_ids_to_delete]
  def stayAlive(self, player_id):
    for i in range(len(self.games)):
      for j in range(len(self.games[i]['players'])):
        if self.games[i]['players'][j]['id'] == player_id:
          self.games[i]['players'][j]['life'] = self.startingLife
      for j in range(len(self.games[i]['spectators'])):
        if self.games[i]['spectators'][j]['id'] == player_id:
          self.games[i]['spectators'][j]['life'] = self.startingLife

  # self.instructions methods
  def fetchInstruction(self, game_id):
    ret = [i for i in self.instructions if i['game_id'] == game_id]
    return ret[0] if ret != [] else None
  def addInstruction(self, newInstruction):
    self.instructions = [i for i in self.instructions if i['game_id'] != newInstruction['game_id']] + [newInstruction]
    return newInstruction

games = Games()

def allGames():
  return games.games
def newGame(game):
  return games.newGame(game)
def joinGame(game):
  return games.joinGame(game)

def fetchInstruction(game_id):
  return games.fetchInstruction(game_id)
def sendInstruction(newInstruction):
  if (newInstruction['action'] == 'new game'):
    deck = gameplay.generateRandomDeck()
    newInstruction['cards'] = {
      'p1_hand': deck[:18],
      'p2_hand': deck[18:36],
      'table': [],
    }
  return games.addInstruction(newInstruction)

def stayAlive(player_id):
  games.stayAlive(player_id)

def live():
  games.age()
  Timer(1, live).start()
Timer(1, live).start()
