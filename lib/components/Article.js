import React from 'react';
import PropTypes from 'prop-types';
import storeProvider from './storeProvider';

const style = {
  article: {
    padding: 50,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  date: {
    color: '#999',
  }
};

const displayDate = (dateString) => {
  return new Date(dateString).toDateString();
};

class Article extends React.PureComponent {
  render() {
    const { article, author } = this.props;
    return (
      <div style={style.article}>
        <div style={style.title}>{article.title}</div>
        <div style={style.date}>{displayDate(article.date)}</div>
        <div style={style.author}>
          <a href={author.website}>
            {author.firstName} {author.lastName}
          </a>
        </div>
        <div style={style.body}>{article.body}</div>
      </div>
    );
  }
}

function extraProps(store, originalProps) {
  return {
    author: store.findAuthor(originalProps.article.authorId)
  };
}

Article.propTypes = {
  article : PropTypes.shape({
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  })
};

export default storeProvider(extraProps)(Article);
