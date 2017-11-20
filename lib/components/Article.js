import React from 'react';

const style = {
  article: {
    padding: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  date: {
    color: '#999',
  }
};

const displayDate = (dateString) => {
  return new Date(dateString).toDateString();
};

const Article = (props) => {
  const { article, actions } = props;
  const author = actions.findAuthor(article.authorId);
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

export default Article;
