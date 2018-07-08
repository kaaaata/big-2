// inputs
const trainingParameters = {
  repetitions: 1,
  minAggression: 2,
  maxAggression: 5
};

const ai = require('./ai');

const totalGames = Math.pow(trainingParameters.maxAggression - trainingParameters.minAggression + 1, 2) * trainingParameters.repetitions;
const startTime = Date.now();
ai.runTraining(trainingParameters);
const timeTaken = (Date.now() - startTime) / 1000;

console.log(`ai training was successful for ${totalGames} games (${Math.round(timeTaken, 3)} sec) (${Math.round(totalGames / timeTaken)} games/sec)`);
