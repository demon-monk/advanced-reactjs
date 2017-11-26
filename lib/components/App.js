import React from 'react';
import PropTypes from 'prop-types';
import ArticleList from './ArticleList';
import SearchBar from './SearchBar';
import pickBy from 'lodash.pickby';
import TimeStamp from './TimeStamp';

class App extends React.Component {
  static childContextTypes = {
    store: PropTypes.object,
  };

  componentDidMount() {
    this.subscribeId = this.props.store.subscribe(() => {
      this.setState(this.props.store.getState());
    });
    this.props.store.startClock();
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
    const searchRe = new RegExp(searchTerm, 'i');
    if (searchTerm) {
      articles = pickBy(articles, (value) => {
        return value.title.match(searchRe) || value.body.match(searchRe);
      });
    }
    return (
      <div>
        <TimeStamp />
        <SearchBar />
        <ArticleList
          articles={articles}
        />
      </div>
    );
  }
}
export default App;
