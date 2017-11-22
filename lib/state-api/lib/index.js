class StateApi {
  constructor(rawData) {
    this.data = {
      articles: this.mapListToObject(rawData.articles),
      authors: this.mapListToObject(rawData.authors)
    };
  }
  mapListToObject(list) {
    return list.reduce((prev, curr) => {
      prev[curr['id']] = curr;
      return prev;
    }, {});
  }

  findAuthor = (authorId) => {
    return this.data.authors[authorId];
  }

  getState = () => {
    return this.data;
  }
}

export default StateApi;
