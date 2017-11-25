import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (extraProps) => (OriginalComp) => {
  return class extends React.Component {
    static displayName = `${OriginalComp.name}Container`;
    static contextTypes = {
      store: PropTypes.object
    };
    render() {
      return <OriginalComp
        {...this.props}
        {...extraProps(this.context.store, this.props)}
      />;
    }
  };
};

export default storeProvider;
