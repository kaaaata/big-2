### inputs ###
training_parameters = {
  'repetitions': 25,
  'min_aggression': 0,
  'max_aggression': 4,
}
######

total_games = (training_parameters['max_aggression'] - training_parameters['min_aggression'] + 1) ** 2 * training_parameters['repetitions']

import time

from models import ai

test_ai = ai._ai()

start_time = time.time()
test_ai.runTraining(training_parameters)
time_taken = time.time() - start_time
print('--> ai training was successful for ' + str(total_games) + ' games (' + str(round(time_taken, 3)) + 's) (' + str(round(total_games / time_taken)) + ' games/sec)')
