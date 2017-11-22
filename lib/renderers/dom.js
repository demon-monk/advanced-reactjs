import React from 'react';
import ReactDOM from 'react-dom';
import StateApi from 'state-api';
import App from 'components/App';

const store = new StateApi(window.initialData);
// const initialData = {
//   articles: {},
//   authors: {}
// };

ReactDOM.render(<App store={ store }/>, document.querySelector('#root'));
