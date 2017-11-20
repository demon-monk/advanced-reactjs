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
  // 定义一组方法，其中一个能够根据articleId找到author信息
  articleActions = {
    findAuthor: (articleId) => this.state.authors[articleId]
  }

  render() {
    return (
      <div>
        <ArticleList
          articles={this.state.articles}
          actions={this.articleActions}
        />
      </div>
    );
  }
}
export default App;
