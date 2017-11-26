import React from 'react';
import storeProvider from './storeProvider';

class TimeStamp extends React.PureComponent {

  render() {
    return (
      <div>
        <p>{this.props.timeStamp}</p>
      </div>
    );
  }
}

function extraProps(store) {
  return {
    timeStamp: store.getState().timeStamp
  };
}

export default storeProvider(extraProps)(TimeStamp);
