# ai.py stores the algorithm to calculate the best hand for the AI to play, given certain inputs.

from . import gameplay
from . import minimax

# a class to store all AI related functionality
class Ai:
  def __init__(self):
    self.wins = {} # record AI # wins during training
    self.games = {} # record AI # games during training

  def runTraining(self, training_parameters):
    # given some training parameters, run a training regimen.

    # map parameters and initialize wins/games tracking
    repetitions = training_parameters['repetitions']
    min_aggression = training_parameters['min_aggression']
    max_aggression = training_parameters['max_aggression']
    for i in range(min_aggression, max_aggression + 1):
      self.wins[i] = 0
      self.games[i] = 0    

    # play the games
    for aggression_i in range(min_aggression, max_aggression + 1):
      # for aggression_j in [18] * (max_aggression - min_aggression + 1): # enable this line to play against a specific AI
      for aggression_j in range(min_aggression, max_aggression + 1):
        for i in range(repetitions):
          self.train(aggression_i, aggression_j)

    # print training results
    for i in self.wins:
      wins = self.wins[i]
      games = self.games[i]
      winrate = round(100 * wins / games)
      print('Aggression ' + str(i) + ': ' + str(winrate) + '% winrate (' + str(wins) + '/' + str(games) + ')')

    return True
    
  def train(self, aggression_i, aggression_j):
    print('training 1 game');
    # run one AI training game (only to be called from self.runTraining)

    # initialize game
    deck = gameplay.generateRandomDeck()
    i_hand = sorted(deck[:18])
    j_hand = sorted(deck[18:36])
    table = []

    # track winrate statistics
    self.games[aggression_i] += 1
    self.games[aggression_j] += 1

    # run the 'game'
    while True:
      table = self.selectBestHandToPlay(i_hand, table, j_hand, aggression_i)
      i_hand = [i for i in i_hand if i not in table]
      if not i_hand:
        self.wins[aggression_i] += 1
        break
      table = self.selectBestHandToPlay(j_hand, table, i_hand, aggression_j)
      j_hand = [i for i in j_hand if i not in table]
      if not j_hand:
        self.wins[aggression_j] += 1
        break

    return True

  def weight(self, play, hand):
    # low weight = do not play. high weight = omg plz play!
    weight = 1000000 # highest weight = 1000000 = default
  
    # if the play is literally the entire hand, it has the highest weight
    if len(play) == len(hand):
      return 1000000

    combo = gameplay.parseHand(play)['combo']
    # components of weight: 
    # 1. power of the hand: high power = strong hand = valuable = low weight (want to save best cards for later)
    # 2. disruption: high disruption = low weight (don't want to break up other hands)
    # note: a hand cannot disrupt other hands with the same combo i.e. 3x can't disrupt 3x. 
    disruption_value = 0

    # decrease the weight by the power of the hand, so AI will play weaker hands first
    weight -= gameplay.parseHand(play)['power']

    # decrease the weight by disruption value. high disruption = higher decrease in weight
    # assign disruption weights based on hand type (this is the ordering of hands AI will play)

    if combo == 'straight':
      disruption_value += 0
    if combo == '2x':
      disruption_value += 10000
    if combo == '1x':
      disruption_value += 20000
    if combo == '3x':
      disruption_value += 30000
    if combo == 'full house':
      disruption_value += 40000
    if combo == 'flush':
      disruption_value += 50000
    if combo == '4x':
      disruption_value += 60000
    if combo == 'straight flush':
      disruption_value += 70000

    # assign disruption weights based on actual hands disrupted
    if combo != 'straight flush':
      for i in gameplay.all5x(hand, 'straight flush'):
        disruption_value += len(set(i).intersection(play)) * 250
    if combo != '4x':
      for i in gameplay.all5x(hand, '4x'):
        disruption_value += len(set(i).intersection(play)) * 100
    if combo != 'full house':
      for i in gameplay.all5x(hand, 'full house'):
        disruption_value += len(set(i).intersection(play)) * 50
    if combo != '3x':
      for i in gameplay.all1x2x3x4x(hand, 3):
        disruption_value += len(set(i).intersection(play)) * 25
    if combo != '2x':
      for i in gameplay.all1x2x3x4x(hand, 2):
        disruption_value += len(set(i).intersection(play)) * 10
    if combo != 'straight':
      for i in gameplay.all5x(hand, 'straight'):
        disruption_value += len(set(i).intersection(play)) * 5
    if combo != 'flush':
      for i in gameplay.all5x(hand, 'flush'):
        disruption_value += len(set(i).intersection(play)) * 1

    return weight - disruption_value

  def selectBestHandToPlay(self, hand, table, opponentCards, aggression):
    # select theoretical best hand to play given hand, table, opponentCards, aggression
    # 1. if the hands are small enough, use minimax
    # 2. otherwise, get all possible plays in order from smallest to largest (possible play = can play and beat table)
    # 3. assign each play a weight based on its power and its disruption and choose the best one (highest weight)

    # 'slam jam it' if AI can win this turn
    if not table and gameplay.parseHand(hand):
      return hand

    # print('current table', table)
    # use minimax if hands are small enough
    if len(hand) + len(opponentCards) <= 12:
      return minimax.select_best_hand_to_play(hand, opponentCards, table, 'p1')

    # generate all the possibile hands, put a disruption value on each hand, and pick the optimal one based on given parameters
    # hands are ordered from lowest strength to highest strength

    possibilities = [{ 'cards': i, 'weight': self.weight(i, hand) } for i in gameplay.possibilities(hand, table)]
    # print hand and all possibilities of that hand
    # print('hand: ', hand)
    # print(possibilities)
    return [] if not possibilities else (max(possibilities, key = lambda x: x['weight'])['cards'] if aggression <= len(opponentCards) or aggression <= len(hand) else possibilities[len(possibilities) - 1]['cards'])

ai = Ai()

def selectBestHandToPlay(hand, table, opponentCards, aggression):
  return ai.selectBestHandToPlay(hand, table, opponentCards, aggression)
