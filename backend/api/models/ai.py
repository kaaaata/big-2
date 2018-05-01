# ai.py stores the algorithm to calculate the best hand for the AI to play, given certain inputs.

from . import gameplay
import math

# a class to store all AI related functions
class _ai:
  def __init__(self):
    self.wins = []

  def runTraining(self, training_parameters):
    # given some training parameters, run a training regimen.

    # parameters
    repetitions = training_parameters['repetitions']
    min_aggression = training_parameters['min_aggression']
    max_aggression = training_parameters['max_aggression']

    for aggression_i in range(min_aggression, max_aggression + 1):
      for aggression_j in range(min_aggression, max_aggression + 1):
        for i in range(repetitions):
          self.train(aggression_i, aggression_j)
    for i in range(min_aggression, max_aggression + 1):
      wins = self.wins.count(i)
      winrate = round(100 * wins / (repetitions * ((max_aggression - min_aggression + 1) * 2 - 1)))
      print('Aggression ' + str(i) + ': ' + str(wins) + ' wins, ' + str(winrate) + '% winrate')
    return self.wins
    
  def train(self, aggression_i, aggression_j):
    # run one AI training game
    deck = gameplay.generateRandomDeck()
    i_hand = sorted(deck[:18])
    j_hand = sorted(deck[18:36])
    table = []
    while True:
      table = self.selectBestHandToPlay(i_hand, table, len(j_hand), aggression_i)
      i_hand = [i for i in i_hand if i not in table]
      if len(i_hand) == 0:
        self.wins.append(aggression_i)
        break;
      table = self.selectBestHandToPlay(j_hand, table, len(i_hand), aggression_j)
      j_hand = [i for i in j_hand if i not in table]
      if len(j_hand) == 0:
        self.wins.append(aggression_j)
        break;
    return []

  def selectBestHandToPlay(self, hand, table, opponentCards, aggression):
    # select theoretical best hand to play given hand, table, opponentCards, aggression

    # 'slam jam it' if AI can win this turn
    _hand = gameplay.parseHand(hand)
    _table = gameplay.parseHand(table)

    if _hand != None:
      if _table == None or _hand['combo'] == _table['combo'] and _hand['power'] > _table['power']:
        return hand

    # generate all the possibile hands, and pick the optimal one based on given parameters
    possibilities = self.possibilities(hand, table)
    return [] if possibilities == [] else (possibilities[0] if (18 - opponentCards) > aggression else possibilities[len(possibilities) - 1])

  def possibilities(self, hand, table):
    # given a hand and a table, return all possible valid combinations to play to the table

    ret = []
    table = gameplay.parseHand(table)

    if table == None:
      ret += self.all1x2x3x4x(hand, 1)
      ret += self.all1x2x3x4x(hand, 2)
      ret += self.all1x2x3x4x(hand, 3)
      ret += self.all5x(hand, 'straight')
      ret += self.all5x(hand, 'flush')
      ret += self.all5x(hand, 'full house')
      ret += self.all5x(hand, '4x')
      ret += self.all5x(hand, 'straight flush')
      return ret
    elif table['combo'] in ['1x', '2x', '3x']:
      ret += self.all1x2x3x4x(hand, int(table['combo'][0]))
    elif table['combo'] == '5x':
      if table['power'] < 2000:
        ret += self.all5x(hand, 'straight')
      if table['power'] < 3000:
        ret += self.all5x(hand, 'flush')
      if table['power'] < 4000:
        ret += self.all5x(hand, 'full house')
      if table['power'] < 5000:
        ret += self.all5x(hand, '4x')
      if table['power'] < 6000:
        ret += self.all5x(hand, 'straight flush') # ai will always add straight flush.

    # remove duplicates (due to straight/flush/straight flush duplication) (list(set(ret)) throws error for some reason)
    new_ret = []
    for i in ret:
      if i not in new_ret:
        new_ret.append(i)
    ret = new_ret

    # filter out hands that do not beat the table, then sort
    ret = [i for i in ret if gameplay.parseHand(i)['power'] > (table['power'] if table else 0)]
    return sorted(ret, key = lambda i: gameplay.parseHand(i)['power'])

  def all1x2x3x4x(self, hand, x):
    # get all possible singles, pairs, triplets, or fours (x = 1, 2, 3, 4)

    ret = []

    if x == 1:
      ret = [[i] for i in hand]
    else:
      # 1. filter out singles, pairs, if necessary.
      filter_unplayables = [i for i in hand if gameplay.rankCount(i, hand) >= x]
      if filter_unplayables == []: # end immediately if no playable hands
        return []
      # 2. partition by rank [[x, x], [x, x]]
      partition_ranks = [[filter_unplayables[0]]]
      for i in range(1, len(filter_unplayables)):
        if filter_unplayables[i] // 10 == partition_ranks[len(partition_ranks) - 1][0] // 10:
          partition_ranks[len(partition_ranks) - 1].append(filter_unplayables[i])
        else:
          partition_ranks.append([filter_unplayables[i]])
      # 3. add all perms in each rank division
      for partition in partition_ranks:
        ret += gameplay.allCombinations(partition, x)
    # 4. finish

    return ret if x == 4 else sorted(ret, key = lambda i: gameplay.parseHand(i)['power'])

  def all5x(self, hand, x):
    # get straight flushes, four of a kinds, full houses, flushes, and straights

    if len(hand) < 5: # end immediately if no playable hands
      return []

    def rank(card):
      return card // 10

    ret = []
    ranks = [rank(i) for i in hand]

    if x == '4x':
      # 1. get all fours
      fours = self.all1x2x3x4x(hand, 4) # like [[x, x, x, x]]
      # 2. for each four, add a single of every other rank
      for four in fours:
        for i in hand:
          if rank(i) != rank(four[0]):
            ret.append(four + [i])
    elif x == 'full house':
      # 1. get all pairs and triplets
      pairs = self.all1x2x3x4x(hand, 2)
      triplets = self.all1x2x3x4x(hand, 3)
      # 2. for each pair, add a triplet of every other rank
      for pair in pairs:
        for trip in triplets:
          if rank(trip[0]) != rank(pair[0]):
            ret.append(pair + trip)
    else:
      # generate flushes and straights without returning. the intersection of these will be straight flushes
      # 1. generate all flushes with unique max rank with lowest 4 as fodder
      flushes = []
      for suit in range(4):
        filter_suit = [i for i in hand if i % 10 == suit]
        if len(filter_suit) < 5:
          continue
        for flush_max_card in filter_suit[4:]:
          flushes.append(filter_suit[:4] + [flush_max_card])
      # 2. generate all straights
      straights = []
      for i in range(len(hand)):
        if (rank(hand[i]) + 1 in ranks) and (rank(hand[i]) + 2 in ranks) and (rank(hand[i]) + 3 in ranks) and (rank(hand[i]) + 4 in ranks):
          new_straights = [[hand[i]]]
          additions = []
          for next_rank in [1, 2, 3, 4]:
            all_next_rank = [j for j in hand if rank(j) == ranks[i] + next_rank]
            for next_rank_card in all_next_rank:
              for straight in new_straights:
                additions.append(straight + [next_rank_card])
            new_straights = additions
            additions = []
          straights += [straight for straight in new_straights if len(straight) == 5]
      # 3. use flushes and straights lists to derive straight, flush, and straight flush
      if x == 'straight':
        ret = straights
      elif x == 'flush':
        ret = flushes
      elif x == 'straight flush':
        ret = [straight for straight in straights if gameplay.allEqual([i % 10 for i in straight])]
    # 4. finish
    return sorted(ret, key = lambda i: gameplay.parseHand(i)['power'])

ai = _ai()
