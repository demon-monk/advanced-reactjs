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
    if (searchTerm) {
      articles = pickBy(articles, (value) => {
        return value.title.match(searchTerm) || value.body.match(searchTerm);
      });
    }
    return (
      <div>
        <TimeStamp timeStamp={this.state.timeStamp} />
        <SearchBar doSearch={this.props.store.setSearchTerm}/>
        <ArticleList
          articles={articles}
        />
      </div>
    );
  }
}
export default App;
