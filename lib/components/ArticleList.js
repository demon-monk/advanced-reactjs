import React from 'react';
import Article from './Article';

class ArticleList extends React.PureComponent {

  render() {
    return (
      <div>
        {Object.values(this.props.articles).map((article) =>
          <Article
            article={article}
            key={article.id}
          />
        )}
      </div>
    );
  }
}

export default ArticleList;
