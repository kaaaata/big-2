const express = require('express');
const bodyParser = require('body-parser');

const data = require('../models/data');
const gameplay = require('../models/gameplay');
const ai = require('../models/ai');

// SETUP
const port = 3001;
const app = express();
// process.env.NODE_ENV = 'production';
if (process.env.NODE_ENV === 'production') app.use(express.static(__dirname + '/../build'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // customize which routes are console logged
  const pathsToLog = [
    '/sendInstruction',
    '/validPlay',
    '/newGame',
    '/joinGame',
    '/selectBestHandToPlay'
  ];
  if (pathsToLog.includes(req.path)) {
    console.log(`${req.path} ${req.method}, body=${JSON.stringify(req.body)}`);
  }
  next();
});

app.listen(process.env.PORT || port);

// GET
app.get('/allGames', (req, res, next) => {
  const output = data.allGames();
  res.status(200).json(output);
});
app.get('/fetchInstruction/:gameId', (req, res, next) => {
  const output = data.fetchInstruction(req.params.gameId);
  res.status(200).json(output);
});

// POST
app.post('/newGame', (req, res, next) => {
  const output = data.newGame(req.body);
  res.status(201).json(output);
});
app.post('/joinGame', (req, res, next) => {
  const output = data.joinGame(req.body);
  res.status(201).json(output);
});
app.post('/validPlay', (req, res, next) => {
  // should be a get request
  const output = gameplay.validPlay(req.body);
  res.status(201).json(output);
});
app.post('/sendInstruction', (req, res, next) => {
  const output = data.readInstruction(req.body);
  res.status(201).json(output);
});
app.post('/stayAlive/:playerId', (req, res, next) => {
  const output = data.stayAlive(req.params.playerId);
  res.status(201).json(output);
});
app.post('/selectBestHandToPlay', (req, res, next) => {
  // should be a get request
  const {
    hand,
    table,
    opponentCards,
    aggression
  } = req.body;
  const output = ai.selectBestHandToPlay(hand, table, opponentCards, aggression);
  res.status(201).json(output);
});
