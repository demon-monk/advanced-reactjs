import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from 'components/App';
import axios from 'axios';
import StateApi from 'state-api';
import config from 'config';

const serverRender = async () => {
  const url = `http://${config.host}:${config.port}/ajax/data`;
  const resp = await axios.get(url);
  const store = new StateApi(resp.data);
  // const initialData = store.getState();
  return {
    initialMarkup: ReactDOMServer.renderToString(<App store={ store }/>),
    initialData: resp.data
  };
};

export default serverRender;
