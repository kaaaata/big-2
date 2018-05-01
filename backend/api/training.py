import time

from models import ai

test_ai = ai._ai()

training_parameters = {
  'repetitions': 500,
  'min_aggression': 0,
  'max_aggression': 5,
}

start_time = time.time()
test_ai.runTraining(training_parameters)
print('--> ai training was successful for ' + str((training_parameters['max_aggression'] - training_parameters['min_aggression'] + 1) ** 2 * training_parameters['repetitions']) + ' games (' + str(round(time.time() - start_time, 3)) + 's)')
