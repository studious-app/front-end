const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const cors = require("cors");

app.use(express.static(__dirname + '/'));

app.use(cors({
  origin: '*',
  optionsSuccessStatus: 200 // For legacy browser support
}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

app.get('/classes', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.get('/course/:id', (req, res) => {
  res.sendFile(__dirname + '/course.html');
});

app.use(express.static(__dirname));

server.listen(3333, () => {
  console.log('listening on *:3333');
});
