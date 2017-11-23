import React from 'react';
// import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import ArticleList from '../ArticleList';
import Article from '../Article';
import Adapter from 'enzyme-adapter-react-16';

Article.propTypes = {};
Enzyme.configure({ adapter: new Adapter() });
describe('ArticleList', () => {
  const testProps = {
    articles: {
      a: 'a',
      b: 'b',
    },
  };
  it('renders correctly', () => {
    const wrapper = shallow(
      <ArticleList
        {...testProps}
      />
    );
    // console.log(wrapper);
    expect(wrapper.find('Article').length).toBe(2);
    expect(wrapper).toMatchSnapshot();
  });
});
