import React from 'react';
import dataApi from '../dataApi';
import { data } from '../testData.json';
import ArticleList from './ArticleList';

const api = new dataApi(data);


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: api.getArticles(),
      authors: api.getAuthors(),
    };
  }

  render() {
    return (
      <div>
        <ArticleList
          articles={this.state.articles}
          authors={this.state.authors}
        />
      </div>
    );
  }
}
export default App;
