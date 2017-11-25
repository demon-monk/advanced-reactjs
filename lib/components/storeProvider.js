import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (extraProps) => (OriginalComp) => {
  return class extends React.PureComponent {
    static displayName = `${OriginalComp.name}Container`;
    static contextTypes = {
      store: PropTypes.object
    };
    onStoreChange = () => {
      this.forceUpdate();
    }
    componentDidMount() {
      this.subscribeId = this.context.store.subscribe(this.onStoreChange);
    }
    componentWillUnmount() {
      this.context.store.unsubscribe(this.subscribeId);
    }
    render() {
      return <OriginalComp
        {...this.props}
        {...extraProps(this.context.store, this.props)}
      />;
    }
  };
};

export default storeProvider;
