# ai.py stores the algorithm to calculate the best hand for the AI to play, given certain inputs.

from . import gameplay

# a class to store all AI related functions
class _ai:
  def __init__(self):
    self.wins = []
  def startTraining(self, repetitions):
    # for all possible aggression levels, play #repetitions games against each other level of aggression. 
    # min aggression: 0 (always play smallest combination)
    # max aggrssion: 18 (always play largest combination) 
    # 1 repetition = 18^2 = 361 games 
    for aggression_i in range(19):
      for aggression_j in range(19):
        for i in range(repetitions):
          self.train(aggression_i, aggression_j)
  def train(self, aggression_i, aggression_j):
    deck = gameplay.generateRandomDeck()
    i_hand = deck[:18]
    j_hand = deck[18:36]
    table = []
    while True:
      possibilities = self.possibilities(i_hand, table)
      play = [] if possibilities == [] else (possibilities[0] if (18 - len(j_hand)) > aggression_i else possibilities[len(possibilities) - 1])
      table = play
      i_hand = [i for i in i_hand if i not in play]
      if len(i_hand) == 0:
        self.wins.append(aggression_i)
        return;
      possibilities = self.possibilities(j_hand, table)
      play = [] if possibilities == [] else (possibilities[0] if (18 - len(i_hand)) > aggression_j else possibilities[len(possibilities) - 1])
      table = play
      j_hand = [i for i in j_hand if i not in play]
      if len(j_hand) == 0:
        self.wins.append(aggression_j)
        return;
  def possibilities(self, hand, table):
    ret = []
    table = gameplay.parseHand(table)

    if table == None:
      ret += self.all5x(hand, 'straight')
      ret += self.all1x2x3x4x(hand, 2)
      ret += self.all1x2x3x4x(hand, 3)
      ret += self.all5x(hand, 'flush')
      ret += self.all1x2x3x4x(hand, 1)
      ret += self.all5x(hand, 'full house')
      ret += self.all5x(hand, '4x')
      ret += self.all5x(hand, 'straight flush')
      return ret
    elif table.combo in ['1x', '2x', '3x']:
      ret += self.all1x2x3x4x(hand, int(table['combo'][0]))
    elif table.combo == '5x':
      if table.power < 2000:
        ret += self.all5x(hand, 'straight')
      if table.power < 3000:
        ret += self.all5x(hand, 'flush')
      if table.power < 4000:
        ret += self.all5x(hand, 'full house')
      if table.power < 5000:
        ret += self.all5x(hand, '4x')
      if table.power < 6000:
        ret += self.all5x(hand, 'straight flush') # ai will always add straight flush.

    return [i for i in ret if gameplay.parseHand(table)['power'] > (table['power'] if table else 0)]
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
    ret = []
    if x == '4x':
      # 1. get all fours
      fours = self.all1x2x3x4x(hand, 4) # like [[x, x, x, x]]
      # 2. for each four, add a single of every other rank
      for four in fours:
        for i in hand:
          if i // 10 != four[0] // 10:
            ret.append(four + [i])
    elif x == 'full house':
      # 1. get all pairs and triplets
      pairs = self.all1x2x3x4x(hand, 2)
      triplets = self.all1x2x3x4x(hand, 3)
      # 2. for each pair, add a triplet of every other rank
      for pair in pairs:
        for trip in triplets:
          if trip[0] // 10 != pair[0] // 10:
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
      straights = gameplay.allStraights(hand)
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
