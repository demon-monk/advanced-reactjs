import React from 'react';
import renderer from 'react-test-renderer';
import ArticleList from '../ArticleList';


describe('ArticleList', () => {
  const testProps = {
    articles: {
      a: 'a',
      b: 'b',
    },
    articleActions: {
      findAuthor: jest.fn(() => ({})), // mock up
    }
  };
  it('renders correctly', () => {
    const tree = renderer.create(
      <ArticleList
        actions={testProps.articleActions}
        articles={testProps.articles}
      />
    ).toJSON();
    // console.log(tree.toJSON());
    // expect(tree.children.length).toBe(2);
    expect(tree).toMatchSnapshot();
  });
});
