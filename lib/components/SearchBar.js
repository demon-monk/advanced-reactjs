import React from 'react';
import debounce from 'lodash.debounce';

const style = {
  float: 'right',
  marginRight: 100
};

class SearchBar extends React.Component {
  state = {
    searchTerm: ''
  };
  doSearch = debounce(() => {
    this.props.doSearch(this.state.searchTerm);
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

export default SearchBar;
