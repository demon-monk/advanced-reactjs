import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (OriginalComp) => {
  return class extends React.Component {
    static displayName = `${OriginalComp.name}Container`;
    static contextTypes = {
      store: PropTypes.object
    };
    render() {
      return <OriginalComp {...this.props} store={this.context.store} />;
    }
  };
};

export default storeProvider;
