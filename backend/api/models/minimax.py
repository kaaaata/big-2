class Minimax:
  def __init__(self):
    # tree max depth 36 (18 cards per player, not including option to pass)
    # p1 wants a score of 100. p2 wants a score of -100. 
    self.tree = {
      'hand': [],
      'table': [],
      'value': None,
      'children': [],
    }

  # generate the whole tree given p1 hand and p2 hand (18 cards default each)
  def generate_tree(self, p1, p2):
    self.tree['hand'] = p1
  
minimax = Minimax()
