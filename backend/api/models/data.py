# data.py stores shared data on server for sharing with clients.

# from django.db import models
from threading import Timer
from . import gameplay

# a class to store all game data in memory
class Games:
  def __init__(self):
    self.games = []
    self.instructions = []
    self.startingLife = 7

  def newGame(self, newGame):
    # initialize a new game with one player in the p1 slot, returning the newly created game object
    # generate starting hands from randomized deck of big2ranks
    deck = gameplay.generateRandomDeck()

    game = {
      'id': newGame['id'],
      # all players and spectators have id, name, and life (representing whether they are active or not)
      'players': [],
      'p1_hand': deck[:18],
      'p2_hand': deck[18:36],
      'active_cards': [],
      'table': [],
      'turn': 'p1',
      'spectators': [],
    }

    if game['id'].startswith('1vAI_'): # need to refactor AI life eventually
      game['players'] = [
        { 'id': newGame['p1']['id'], 'name': newGame['p1']['name'], 'life': self.startingLife },
        { 'id': newGame['p2']['id'], 'name': newGame['p2']['name'], 'life': 999999999999 },
      ]
    elif game['id'].startswith('AIvAI_'):
      game['players'] = [
        { 'id': newGame['p1']['id'], 'name': newGame['p1']['name'], 'life': 999999999999 },
        { 'id': newGame['p2']['id'], 'name': newGame['p2']['name'], 'life': 999999999999 },
      ]
      game['spectators'].append(
        { 'id': newGame['spectator']['id'], 'name': newGame['spectator']['name'], 'life': self.startingLife },
      )
    else:
      game['players'] = [
        { 'id': newGame['p1']['id'], 'name': newGame['p1']['name'], 'life': self.startingLife }
      ]

    self.games = [game] + self.games
    return game

  def readInstruction(self, instruction):
    # read instruction from client, modifying the game object
    game_id = instruction['game_id']
    action = instruction['action']
    player = instruction['player']
    cards = instruction['cards']

    # modify the game object
    for game in self.games:
      if game['id'] == game_id:
        # activate or deactivate cards
        if action == 'activate':
          game['active_cards'] += cards
          game['active_cards'] = [i for i in game['active_cards'] if game['active_cards'].count(i) == 1]
        elif action == 'play_active_cards':
          hand = 'p1_hand' if player == game['players'][0]['id'] else 'p2_hand'
          cards = [i for i in game['active_cards'] if i in game[hand]]
          game['table'] = cards
          game[hand] = [i for i in game[hand] if i not in cards]
          game['active_cards'] = [i for i in game['active_cards'] if i not in cards]
          game['turn'] = 'p2' if hand == 'p1_hand' else 'p1'
        elif action == 'new_game':
          deck = gameplay.generateRandomDeck()
          game['p1_hand'] = deck[:18]
          game['p2_hand'] = deck[18:36]
          game['active_cards'] = []
          game['table'] = []

        # add the instruction for other clients to poll
        self.instructions = [i for i in self.instructions if i['game_id'] != game_id] + [instruction]
        return game

  def fetchInstruction(self, game_id):
    # when clients poll for instruction, retrieve both the instruction and the game object
    instruction = [i for i in self.instructions if i['game_id'] == game_id]
    game = [i for i in self.games if i['id'] == game_id]
    return {
      'instruction': instruction[0] if instruction != [] else None,
      'game': game[0] if game else None,
    }

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

  def age(self):
    # decrease player life every 1s if life reaches 0, player is 'disconnected'. life resets to self.startingLife every 5s from client.
    game_ids_to_delete = []
    for i in range(len(self.games)):
      for j in range(len(self.games[i]['players'])):
        self.games[i]['players'][j]['life'] -= 1
        game = self.games[i]
        # if players have disconnected for too long, or if there are no spectators in AIvAI_, delete game.
        if game['players'][j]['life'] == 0 or game['id'].startswith('AIvAI_') and game['spectators'] == []:
          game_ids_to_delete.append(self.games[i]['id']) # probably should not delete the game right away but let's work on this later
      for j in range(len(self.games[i]['spectators'])):
        self.games[i]['spectators'][j]['life'] -= 1
        # if a spectator has disconnected for too long, remove them from the game
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
  return games.readInstruction(newInstruction)

def stayAlive(player_id):
  games.stayAlive(player_id)

def live():
  games.age()
  Timer(1, live).start()
Timer(1, live).start()
