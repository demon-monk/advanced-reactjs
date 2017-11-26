import React from 'react';
import debounce from 'lodash.debounce';
import storeProvider from './storeProvider';

const style = {
  float: 'right',
  marginRight: 100
};

class SearchBar extends React.PureComponent {
  state = {
    searchTerm: ''
  };
  doSearch = debounce(() => {
    this.props.store.setSearchTerm(this.state.searchTerm);
  }, 300);

  handleSearch = (e) => {
    this.setState({ searchTerm: e.target.value }, this.doSearch);
  }
  render() {
    return (
      <div style={style}>
        <input type="search"
          placeholder="enter keyword to filter the results"
          value={this.state.searchTerm}
          onChange={this.handleSearch}
        />
      </div>
    );
  }
}

export default storeProvider()(SearchBar);
