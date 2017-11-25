import React from 'react';
import PropTypes from 'prop-types';
import ArticleList from './ArticleList';
import SearchBar from './SearchBar';
import pickBy from 'lodash.pickby';

class App extends React.Component {
  static childContextTypes = {
    store: PropTypes.object,
  };

  componentDidMount() {
    this.subscribeId = this.props.store.subscribe(() => {
      this.setState(this.props.store.getState());
    });
  }

  getChildContext() {
    return {
      store: this.props.store
    };
  }
  state = this.props.store.getState();

  componentWillUnmount() {
    this.props.unsubscribe(this.subscribeId);
  }

  render() {
    let { articles, searchTerm } = this.state;
    if (searchTerm) {
      articles = pickBy(articles, (value, key) => {
        return value.title.match(searchTerm) || value.body.match(searchTerm);
      });
    }
    return (
      <div>
        <SearchBar doSearch={this.props.store.setSearchTerm}/>
        <ArticleList
          articles={articles}
        />
      </div>
    );
  }
}
export default App;
