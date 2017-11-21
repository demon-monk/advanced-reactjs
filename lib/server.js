import express from 'express';
import config from './config';
import serverRender from './serverRender';

const app = express();

app.use(express.static('public')); // serve static files from react app
app.set('view engine', 'ejs'); // server side rendering from ejs template

app.get('/', function(req, res) {
  const initialContent = serverRender();
  console.log(initialContent);
  res.render('index', { answer: initialContent });
});

app.listen(config.port, function() {
  console.log(`app is running at ${config.port} ...`);
});
