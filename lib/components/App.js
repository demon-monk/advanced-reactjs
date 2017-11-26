import React from 'react';
import PropTypes from 'prop-types';
import ArticleList from './ArticleList';
import SearchBar from './SearchBar';
import pickBy from 'lodash.pickby';
import TimeStamp from './TimeStamp';
import Perf from 'react-addons-perf';

if (typeof window !== 'undefined') {
  window.Perf = Perf;
}
class App extends React.PureComponent {
  static childContextTypes = {
    store: PropTypes.object,
  };

  appState = () => {
    const { articles, searchTerm } = this.props.store.getState();
    return { articles, searchTerm };
  }

  componentDidMount() {
    this.subscribeId = this.props.store.subscribe(() => {
      this.setState(this.appState());
    });
    this.props.store.startClock();
    setImmediate(() => Perf.start());
    setTimeout(() => {
      Perf.stop();
      Perf.printWasted();
    }, 5000);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return (nextState.articles !== this.state.articles)
  //    || (nextState.searchTerm !== this.state.searchTerm);
  // }

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
        {/* {ArticleList({ articles })} */}
        <ArticleList
          articles={articles}
        />
      </div>
    );
  }
}
export default App;
