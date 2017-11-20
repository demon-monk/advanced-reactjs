class DataApi {
  constructor(rawData) {
    this.rawData = rawData;
  }
  mapListToObject(list) {
    return list.reduce((prev, curr) => {
      prev[curr['id']] = curr;
      return prev;
    }, {});
  }
  getArticles() {
    return this.mapListToObject(this.rawData.articles);
  }

  getAuthors() {
    return this.mapListToObject(this.rawData.authors);
  }
}

export default DataApi;
