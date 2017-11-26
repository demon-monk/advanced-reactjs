class StateApi {
  constructor(rawData) {
    this.data = {
      articles: this.mapListToObject(rawData.articles),
      authors: this.mapListToObject(rawData.authors),
      searchTerm: '',
      timeStamp: new Date().toString()
    };
    this.subscribitions = {};
    this.lastSubscribitionId = 0;
    setTimeout(() => {
      const newArticle = {
        ...rawData.articles[0],
        id: 'fakeArticleId'
      };
      this.data = {
        ...this.data,
        articles: {
          ...this.data.articles,
          [newArticle.id]: newArticle
        }
      };
      // this.data.articles[newArticle.id] = newArticle;
      this.notifySubscribers();
    }, 1000);
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

  subscribe = (cb) => {
    this.lastSubscribitionId ++;
    this.subscribitions[this.lastSubscribitionId] = cb;
    return this.lastSubscribitionId;
  }

  unsubscribe = (lastSubscribitionId) => {
    delete this.subscribitions[lastSubscribitionId];
  }

  notifySubscribers = () => {
    Object.values(this.subscribitions).forEach((cb) => cb());
  }

  mergeState = (newState) => {
    this.data = {
      ...this.data,
      ...newState
    };
    this.notifySubscribers();
  }

  setSearchTerm = (searchTerm) => {
    this.mergeState({
      searchTerm
    });
  }

  setTimeStamp = (timeStamp) => {
    this.mergeState({ timeStamp });
  }

  startClock = () => {
    setInterval(() => {
      this.setTimeStamp(new Date().toString());
    }, 1000);
  }
}

export default StateApi;
