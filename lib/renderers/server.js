import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from 'components/App';
import axios from 'axios';
import dataApi from 'state-api';
import config from 'config';

const serverRender = async () => {
  const url = `http://${config.host}:${config.port}/ajax/data`;
  const resp = await axios.get(url);
  const api = new dataApi(resp.data);
  const initialData = {
    articles: api.getArticles(),
    authors: api.getAuthors()
  };
  return {
    initialMarkup: ReactDOMServer.renderToString(<App initialData={ initialData }/>),
    initialData
  };
};

export default serverRender;
