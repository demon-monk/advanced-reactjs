import React from 'react';
import PropTypes from 'prop-types';

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

const Article = (props, { store }) => {
  const { article } = props;
  const author = store.findAuthor(article.authorId);
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
};

Article.propTypes = {
  article : PropTypes.shape({
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  })
};

Article.contextTypes = {
  store: PropTypes.object
};

export default Article;
