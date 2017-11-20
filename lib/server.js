import express from 'express';
import config from './config';

const app = express();

app.use(express.static('public')); // serve static files from react app
app.set('view engine', 'ejs'); // server side rendering from ejs template

app.get('/', function(req, res) {
  res.render('index', { answer: 42 });
});

app.listen(config.port, function() {
  console.log(`app is running at ${config.port} ...`);
});
