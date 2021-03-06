import express from 'express';
import config from './config';
import serverRender from './renderers/server';
import { data } from './testData.json';

const app = express();

app.use(express.static('public')); // serve static files from react app
app.set('view engine', 'ejs'); // server side rendering from ejs template

app.get('/', async function(req, res) {
  const initialContent = await serverRender();
  res.render('index', { ...initialContent });
});

app.get('/ajax/data', (req, res) => {
  res.send(data);
});

app.listen(config.port, function() {
  console.log(`app is running at ${config.port} ...`);
});
