import React from 'react';
import storeProvider from './storeProvider';

const TimeStamp = (props) => {
  return (
    <div>
      <p>{props.timeStamp}</p>
    </div>
  );
};

function extraProps(store) {
  return {
    timeStamp: store.getState().timeStamp
  };
}

export default storeProvider(extraProps)(TimeStamp);
