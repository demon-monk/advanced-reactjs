import React from 'react';
// import dataApi from 'state-api';
// import axios from 'axios';
// import { data } from '../testData.json';
import ArticleList from './ArticleList';

// const api = new dataApi(data);


class App extends React.Component {
  state = this.props.store.getState();

  // async componentDidMount() {
  //   const resp = await axios.get('/ajax/data');
  //   const api = new dataApi(resp.data);
  //   this.setState(() => {
  //     return {
  //       articles: api.getArticles(),
  //       authors: api.getAuthors()
  //     };
  //   });
  // }

  // 定义一组方法，其中一个能够根据articleId找到author信息
  // articleActions = {
  //   findAuthor: this.props.store.findAuthor
  // }

  render() {
    return (
      <div>
        <ArticleList
          articles={this.state.articles}
          store={this.props.store}
        />
      </div>
    );
  }
}
export default App;
