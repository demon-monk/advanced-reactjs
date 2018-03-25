# chapter1

## 项目结构

```plaintext
lib //前后端公用
/lib/server.js // express app
public // react app
```

```sh
yarn init
yarn add --dev eslint eslint-plugin-react babel-eslint
touch .eslintrc.js
```

把[这个文件](https://github.com/samerbuna/.files/blob/master/.eslintrc.js)的内容拷贝到.eslintrc.js中。

## server 基本框架

```sh
yarn add express ejs
```

写入express app的基本框架

```js
// lib/server.js
const express = require('express');
const config = require('./config');
const app = express();
app.use(express.static('public')); // react app所在位置的静态资源
app.listen(config.port, function() {
    console.log(`express app is running @${config.port}`)
});
```

添加模板引擎，并通过route handler渲染

```sh
mkdir views
touch views/index.ejs
```

```js
// lib/server.js
app.set('view engine', 'ejs'); // 引入ejs模板引擎
app.get('/', function(req, res) {
    res.render('index', { answer: 42 });
});
```

```ejs
<body>
  <h1>
    Hello ejs <%= answer %>
  </h1>
</body>
```

使用pm2来自动重启server，在以后上线过程中也能帮助在集群环境下上线

```sh
yarn add pm2
```

修改package.json文件

```json
"scripts" : {
  "dev": "pm2 start lib/server.js --watch"  
}
```

在终端

```sh
yarn dev
```

就可以在后台启动server了，如果想要查看日志，需要

```hs
yarn pm2 logs
```

![](https://ws1.sinaimg.cn/large/006tKfTcgy1flm0vqfigyj31cc068jsx.jpg)

蓝色标志的log来自pm2，绿色标志的log来自app。

## 为后端项目引入babel，使用最新语法，并识别jsx

```sh
yarn add babel-cli babel-preset-react babel-preset-env babel-preset-stage-2  
```

之所以没有`--dev`，是因为这些包都是要部署上线的，编译过程将会在server上完成。

增加package.json

```json
"babel": {
    "presets": ["react","env","stage-2"]
},
"scripts": {
    "dev": "pm2 start lib/server.js --watch --interpreter babel-node"
}
```

这样我们就可以在`lib/server.js`中使用最新的import语法引入模块了

```js
// lib/server.js
import express from 'express';
import config from './config';
```

## 增加React component

```hs
mkdir lib/components
touch lib/components/Index.js
```

```jsx
// lib/components/Index.js
import React from 'react';
import ReactDOM from 'react-dom';
const App = () => { <h2>Hello React</h2> };
ReactDOM.render(<App />, document.querySelector('#root'));
```

修改index.ejs，增加id为root的元素。

```ejs
<body>
  <div id="root">
    Loading ...
  </div>
</body>
<script src="/bundle.js"></script>
```

```sh
yarn add react react-dom webpack babel-loader
touch webpack.config.js
```

```js
//webpack.config.js
const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'lib', 'components', 'Index.js'),
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        test: /\.js$/,
        exclude: /node_modules/
      }
    ]
  }
};
```

修改package.json

```json
"scripts": {
    "webpack": "webpack -wd"
}
```

这里w代表watch，d代表development或者debug

## 使用class-based component测试配置是否有效

```js
class App extends React.Component {
    state = {
      answer: 42
    };

    asyncFunc = () => {
      return Promise.resolve(36);
    };

    async componentDidMount() {
      this.setState({
        answer: await this.asyncFunc()
      });
    }

    render() {
      return ( <h2>Hello React Class Component {this.state.answer}</h2> );
    }
}
```

但是运行后发现console中会报这样的错误

```js
'Uncaught ReferenceError: regeneratorRuntime is not defined'
```

这是因为我们使用了最新的js语法，需要增加`babel-polyfill`才能正确运行

```sh
yarn add babel-pollyfill
```

在webpack.config.js中的entry中增加babel-polyfill，注意一定要添加在最前面。

```js
entry: ['babel-polyfill', path.join(__dirname, 'lib', 'components', 'Index.js')],
```

everything works OK!

## 准备测试数据

```sh
brew install wget
wget -O lib/testData.json bit.ly/react-blog-test-data
```

此时所有的数据都以json的形式存储在lib/testData.json文件里。

## 数据接口

接下来创建数据接口，用于获取数据，并将这些list类型的数据转换为object类型的，便于修改、查找、删除。

```js
//lib/dataApi.js
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

```

## 安装jest并书写测试用例

```sh
yarn add --dev jest
```

```js
// lib/__test__/dataApi.test.js
import DataApi from '../dataApi';
import { data } from '../testData.json';
const api = new DataApi(data);


describe('data api', () => {
  it('expose articles as an object', () => {
    const articles = api.getArticles();
    const articleId = data.articles[0].id;
    const articleTitle = data.articles[0].title;

    expect(articles).toHaveProperty(articleId);
    expect(articles[articleId].title).toBe(articleTitle);
  });
  it('expose authors as an object', () => {
    const authors = api.getAuthors();
    const authorId = data.authors[0].id;
    const authorFirstName = data.authors[0].firstName;

    expect(authors).toHaveProperty(authorId);
    expect(authors[authorId].firstName).toBe(authorFirstName);
  });
});

```

修改package.json

```json
"scripts": {
    "test": "jest --watch"
}
```

对于最新版本jest（21.2.1）来说，只有在git 仓库中才能使用—watch选项，否则会报错。

```js
`Error: This promise must be present
when running with -o.`
```



## 渲染数据的React component

```jsx
// lib/components/App.js
import React from 'react';
import dataApi from '../dataApi';
import { data } from '../testData.json';
import ArticleList from './ArticleList';

const api = new dataApi(data);


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: api.getArticles(),
      authors: api.getAuthors(),
    };
  }

  render() {
    return (
      <div>
        <ArticleList
          articles={this.state.articles}
          authors={this.state.authors}
        />
      </div>
    );
  }
}
export default App;
```



```jsx
// lib/components/ArticleList.js
import React from 'react';
import Article from './Article';
const ArticleList = (props) => {
  return (
    <div>
      {Object.values(props.articles).map((article) =>
        <Article
          article={article}
          author={props.authors[article.authorId]}
          key={article.id}
        />
      )}
    </div>
  );
};

export default ArticleList;
```



```jsx
// lib/components/Article.js
import React from 'react';

const Article = (props) => {
  const { article, author } = props;
  return (
    <div>
      <div>{article.title}</div>
      <div>{article.date}</div>
      <div>
        <a href={author.website}>
          {author.firstName} {author.lastName}
        </a>
      </div>
      <div>{article.body}</div>
    </div>
  );
};

export default Article;
```

## styling component

给react component添加样式可以有两种方式，一种是给元素添加className，然后添加css样式，另一种是直接通过JavaScript Object的形式以inline的方式添加到元素中去，这里采用第二种。

在`lib/components/Article.js`中的函数式组件外边添加如下代码：（注意这里所有的X-X形式的css名称都用了驼峰式写法）。

```js
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
// function component expression
```

- 为什么不写在定义Article component的函数里边？

  如果定义在函数里边，每次Article被引用并实例化的时候都会创建一个新的style object，这显然是不好的。

  接下来定义一个格式化日期显示的函数，用于将日期显示为更容易阅读的形式。同理，这时候也应该把这个函数定义在函数式组件的外边。

  ```jsx
  const displayDate = (dateString) => new Date(dataString).toDateString();

  //in functional component render function
  <div style={style.date}>{displayDate(article.date)}</div>
  ```

- 结论

  如果要定义一个变量，如果这个变量不依赖于组件内部的数据（比如说依赖于props中的数据），那么最佳实践就是把它定义在组件外边。

## (2-7)组件责任划分

最佳实践：子组件更多地用于展示，更少地了解数据结构。

👆例子中ArticleList组件中，除了要知道他要渲染的数据`props.articles`外，还需要知道外界传入了`props.authors`，并且还要知道能够通过`authorId`查找到对应的元素。一句话，你知道的太多了。既然你起名叫ArticleList，你就只需要知道articles就行了。

整理一下现有的组件，看下谁适合完成找到当前文章作者的任务。首先是Article组件，它是author数据的最终呈现，所以它最迫切需要得到当前author的数据。但是，App组件时所有数据的拥有者。所以最好的一个办法就是让App组件赋予Article组件能够通过其得到的信息（article:{articleId, authorId}）来找到作者的能力。这是通过App组件向子组件传递方法实现的。

```jsx
// lib/components/App
// 定义一组方法，其中一个能够根据articleId找到author信息
  articleActions = {
    findAuthor: (articleId) => this.state.authors[articleId]
  }
  render() {
    return (
      <div>
        <ArticleList
          articles={this.state.articles}
          actions={this.articleActions}
        />
      </div>
    );
  }
// lib/component/ArticleList.js
<div>
  {Object.values(props.articles).map((article) =>
                                     <Article
                                       article={article}
                                       actions={props.actions}
                                       key={article.id}
                                       />
                                    )}
</div>
// lib/component/Article.js
const { article, actions } = props;
const author = actions.findAuthor(article.authorId);
```

当在接下来的迭代中，如果authors数据结构有变，或者具体action有更改、增加，通过传递方式到子组件的形式来获取author信息，不需要更改子组件内容，只需要在父组件中添加action方法就行。

## jest snapshot

snapshot是对react component的树形结构的一种描述，jest通过对比修改前后该树形结构的描述是否一致来判断UI表现是否一致。

```sh
yarn add --dev react-test-renderer
```

首先通过react-test-renderer创建react组件的属性表示形式。

```jsx
import renderer from 'react-test-renderer';
const tree = renderer.create(<div>Hello</div>).toJSON());
// { type: 'div', props: {}, children: [ 'Hello' ] }
```

创建一个利用snapshot测试ArticleList Component的用例文件

当第一次运行该测试用例时，会创建一个全新的snapshot，如果没有什么问题的话应该是测试通过的，并在`__test__/__snapshots__`文件夹下创建对应测试用例的.snap文件，这个文件就是当前测试组件的快照。

```jsx
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
    );
    // console.log(tree.toJSON());
    expect(tree).toMatchSnapshot();
  });
});
```

每次更改的时候，jest都会拿新生成的快照和老的比较，如果一致则测试通过。如果这个时候修改了组件内容，下次测试时就会给出这次和上次不一样的信息，如果确定更改按u键就可以了。

![](https://ws4.sinaimg.cn/large/006tNc79ly1flotdr54xwj30pm04ajrr.jpg)

## server side rendering

至此位置所有的react应用（js代码）都是在浏览器中运行的（如果不信可以在chrome调试工具...>>settings>>check disable javascript，浏览器只能显示一个初始页面，所有的react应用都将不见，每当SEO对网站进行索引的时候，也只能看到这部分初始内容）。通过将同样的react代码在服务端渲染，就可以解决括号中的问题。

跟服务端渲染有关的首先是ejs模板。服务端渲染的意思就是在服务端通过模板拼接好html再发送给浏览器，因此这里先把模板准备好。

```ejs
<div id="root">
  <%- initialContent -%>
</div>
```

在routehandler中传入模板渲染所需要的值。

```js
// lib/server.js
import serverRender from './serverRender';
app.get('/', function(req, res) {
  const initialContent = serverRender();
  res.render('index', { answer: initialContent });
});
```

将react组建渲染成html

```js
// lib/serverRender.js
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './components/App';

const serverRender = () => {
  return ReactDOMServer.renderToString(<App />);
};

export default serverRender;
```

通过服务端渲染有如下几点好处：

- seo效果更好
- 更快地视觉呈现，浏览器不需要运行js就能呈现出html，并且可操作，尤其是当客户端及其较慢时，这种效果就更明显了

# chapter3

## refactor

`lib/component/Index.js`和`lib/serverRender.js`的工作基本类似，前者是将react app渲染到dom中，后者是在服务端将react app渲染到html中。所以这里把他们放到一个统一的文件夹`lib/renderers`下，并分别起名`dom.js`和`server.js`。

这时肯定是报错的，通过命令

```hs
git grep serverRender
```

找到引用原来serverRender.js的地方，如下所示。

![](https://ws2.sinaimg.cn/large/006tNc79gy1flpzk9zp07j30rm03o3z1.jpg)

然后修改这些地方的引用。但随着目录的增多，目录管理变得比较麻烦，如果我们使用相对路径的话，我们必须记着要引用目录和当前目录的相对位置关系，这时候使用绝对路径会好一点。使用绝对路径的方法时在package.json文件中启动服务器的命令修改如下：

```json
"scripts": {
    "dev": "NODE_PATH=./lib pm2 start lib/server.js --watch --interpreter babel-node",
}
```

这条命令的意思是所有的绝对定位起始路径为`./lib`目录。这样我们在引用模块时，就不需要写相对路径了，例如我们在`./lib/renderers/server.js`中引用`./lib/components/App.js`，引用只需要写成这样就可以了（使用相对路径依然有效）：

```js
import App from 'components/App';
```

接下来按照这个方法重构其他的模块引用。

修改过后pm2应该没有什么问题了，但webpack又开始报错了，因为我们把`./lib`作为起始路径的方式仅对pm2有用，对webpack没有。解决这个问题的方法也很简单，在webpack.config.js中添加一个key如下：

```js
resolve: {
    modules: [
      path.resolve('./lib'),
      path.resolve('./node_modules')
    ]
  },
```

这段配置的意思是，webpack在解决模块依赖时，默认从哪些目录寻找。因为我们添加了`./lib`目录，所以当webpack遇到绝对路径引用的时候就会从lib文件夹下找引入的包。在默认情况下这里是有`path.resolve('./node_modules')`的，但鉴于我们使用了这种方法会覆盖掉默认值，所以这里需要明确指出。

当我们想引入自己开发的npm包时，这种通过绝对路径引入模块的形式给了极大的方便。例如我们想把`lib/dataApi.js`作为一个包发布，并在不同的项目中引用。但是这个包还在开发过程中，还不能发布，我们需要在该项目的开发过程中同步开发这个包。通过绝对路径引入这个包，使得在这个包发布之后不需要更改引入包的路径。

```sh
mkdir lib/state-api
mkdir lib/state-api/lib
touch lib/state-api/lib/index.js
cd lib/state-api
yarn init
# 在定义入口文件的问题中输入 lib/index.js
# 将原来dataApi.js中内容复制到 index.js中
# 之后可以通过npm publish 发布这个包
```

之后将原来引入dataApi的地方统一改为

```js
import dataApi from 'state-api';
```

之后将state-api发布到npm后，这里的写法不用更改，因为那个时候state-api在node-modules目录下。

## async api

之前我们把数据存储在本地，通过react直接引入json的形式获取数据，在实际场景中数据通常是通过api的形式获取的。所以首先我们要有一个能返回数据的api。

```js
// lib/server.js
import { data } from './testData.json';

app.get('/ajax/data', (req, res) => {
  res.send(data);
});
```

api好了之后就可以在App component中通过axios访问api获取数据了。

```js
// lib/components/App.js
import axios from 'axios';
// insisde the class expression
state = {
    articles: {},
    authors: {} // 先声明一个空的，因为在render的时候下面的setState还未执行
}
async componentDidMount() {
    const resp = await axios.get('/ajax/data');
    const api = new dataApi(resp.data);
    this.setState(() => {
      return {
        articles: api.getArticles(),
        authors: api.getAuthors()
      };
    });
  }
```

现在client side就OK了，但是server side rendering并未生效。

## async api server side

在server side，仍然使用axios发送请求获取初始render数据。然后在服务端渲染的时候，把这个数据以props的形式传递给<App/>中去。所以第一步，我们的APP组件要能够接受来自props中的参数。

```js
// lib/components/App.js
state = {
    articles: this.props.initialData.articles,
    authors: this.props.initialData.authors
};
```

在浏览器端渲染时，要给App组件传入initialData这个参数。

```jsx
// lib/renderers/dom.js
const initialData = {
  articles: {},
  authors: {}
};

ReactDOM.render(<App initialData={ initialData }/>, document.querySelector('#root'));

```

现在我们的App在浏览器端渲染是没有问题的，现在在服务端渲染的部分通过api请求到的数据塞到App组件中进行渲染。

```jsx
// lib/renderers/server.js
import axios from 'axios';
import config from 'config';
import dataApi from 'state-api';

const serverRender = async () => {
    const resp = await axios.get(`http://${config.host}:${config.port}/ajax/data`);
    const api = new dataApi(resp.data);
    const initialData = {
        articles: api.getArticles(),
        authors: api.getAuthors()
    };
    return ReactDOMServer.renderToString(<App initialData={ initialData } />);
}
```

最后再配置文件中添加关于host的配置

```js
// lib/config.js
module.exports = {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 8080
};
```

现在关闭浏览器的JavaScript功能，刷新页面应该可以看到内容，这说明通过async api获取数据并进行服务端渲染的操作生效了。打开浏览器端的JavaScript，可以发现页面稳定显示之前其实是进行了三次渲染：

- 初始的服务端渲染
- JavaScript开始执行，并给App组件传入一个articles和authors都为空的初始值，此时页面应该是空白的
- JavaScript通过async api获取数据，并传递给App组件，此时页面又重新开始有内容

这显然是比较浪费感情的，接下来我们要避免这些额外的渲染。

## 避免client side重复渲染

在服务端渲染中已经通过api请求将数据渲染到html中的页面，浏览器端就不应该再进行请求重复渲染（👆第三条），因此在App组件中componentDidMount中的所有逻辑都应该干掉。

然后client端JavaScript在初始化的时候不应该传一个空值，这会迫使页面变成空白。要获取数据，肯定不能再发一次ajax请求，因为服务端已经有数据了，这时候就要找一个办法把服务端的数据带到client端，这里我们采用全局变量window来携带这个初始值。在服务端渲染时，我们会获取到initialData，除了html字符串，我们在进行ejs模板渲染的时候也要把这个值传进去。

首先在服务端渲染时，要把这个值传出来。

```jsx
// lib/renderers/server.js
const serverRender = async () => {
    // ...原来的内容
  	return {
        initialMarkup: ReactDOMServer.renderToString(<App initialData={ initialData } />),
        initialData
    };
}
```

然后在把这个值，传入ejs模板中。

```js
// lib/server.js
app.get('/', async (req, res) => {
    const initialContent = await serverRender();
    res.render('index', { ...intialContent });
});
```

在ejs模板中，把这个值放入全局变量window里。

```ejs
<!-- views/index.ejs -->
<script>window.initialData = <%- initialData -%></script>
<div id="root"><%- initialMarkup -%></div>
```

在client端渲染时，获取到这个全局变量，并把它作为初始值传入App组件。

```jsx
// lib/renderers/dom.js
ReactDOM.render(<App initialData={window.initialData} />, document.querySelector('#root'));
```

## state manager

接下来重构目前的代码，让状态管理由一个单独的模块来完成，也就是我们的`state-api`模块。

这里我们获取数据直接通过`getState`方法获取，为了避免在每次获取数据的时候都调用mapListToObject操作，我们用一个数据在新建StateApi对象的时候就将数据准备好，每次调用getState直接返回这个数据。新建对象（叫它store吧）中管理所有的数据，因此通过authorId寻找author的任务交给它再合适不过了，所以这里实现findAuthor方法。

```js
// lib/state-api/lib/index.js
class StateApi {
    constructor(rawData) {
        this.data = {
            articles: this.mapListToObject(rawData.articles),
            authors: this.mapListToObject(rawData.authors)
        };
    }
  // implementation of mapListToArticles
  getState = () => {
      return this.data;
  }
  findAuthor = (authorId) => {
      return this.data.authors[authorId];
  }

}
```

接下来我们在服务端渲染和client端渲染的时候都不必再手动组装初始数据，直接调用getState就可以了。首先是服务端渲染。

```jsx
// lib/renderers/server.js
import StateApi from 'state-api';
// in serverRener function
const store = new StateApi(resp.data);
return {
    initialMarkup: ReactDOMServer.renderToString(<App store={store} />),
    initialData: resp.data
}
```

然后是client端渲染。

```jsx
// lib/renderers/dom.js
import StateApi from 'state-api';
const store = new StateApi(window.initData);
ReactDOM.render(<App store={store} />, document.querySelector('#root'));
```

在App组件中，我们只需要将getState返回的值直接作为state的初始值就可以了。因为store中实现了findAuthor方法，原来拼接的actions就不必要了，我们只需要将store传递给最后的Article组件，Article就能根据这个方法找到对应的作者。

```jsx
// lib/components/App.js
class App extends React.Component {
    state = this.props.store.getState();
	// remove actions composition
	//render
	render() {
      <div>
        <ArticleList
          articles={this.state.articles}
          store={this.props.store}
        />
      </div>
    }
}
```

```jsx
// lib/components/ArticleList.js
const ArticleList = (props) => {
  return (
    <div>
      {Object.values(props.articles).map((article) =>
        <Article
          article={article}
          store={props.store}
          key={article.id}
        />
      )}
    </div>
  );
};
```

```js
// lib/components/Article.js
const { article, store } = props;
const author = store.findAuthor(article.authorId);
```

目前为止我们的store是从父组件一级一级传递给子组件的，即使中间有些组件不需要store，也被迫要传递这个值。接下来我们要避免这种操作。

# context API and HOC

## propType

数据通过prop传递给组件时，有时可能会遗漏某些数据，或者数据类型与期望的不一致，react组件遇到这种问题，会想当然地去渲染这些数据，不会给出任何提示。因此我们需要proptype来确定组件中props属性的各个key的类型、必要与否，从而减少调试的难度。

```js
// lib/components/Article.js
import PropTypes from 'prop-types'; // npm package
Article.propTypes = {
    article: PropTypes.shape({
        title: PropTypes.string.isRequired,
        body: PropTypes.string.isRequired,
        date: PropTypes.string.isRequired,
    })
};
```

## context API

之前我们在Article组件使用store的findAuthor方法时需要从App组件一直往下一级级传递prop.store到Article组件。中间的ArticleList组件其实是不需要这个方法的，但确被迫传入了这个props。这里我们使用Context API来让Article组件不经过ArticleList直接获取store。

首先在持有数据的组件中定义全局的context对象。

```js
// lib/components/App.js
import PropTypes from 'prop-types';
// inside the class-based React Component
static childContextTypes = {
    store: PropTypes.object
};
getChildContext() {
    // 这里返回的就是全局的context对象
    return {
        store: this.props.store
    };
}
// 在render函数中去掉对store的props传递
```

然后在想要获取全局context对象的组件中，定义contextTypes，对于函数式组件，函数传入的第二个参数就是context对象，对于class-based组件而言，通过`this.context`来访问全局context对象。

```js
// lib/components/Article.js
// functional component的第二个参数传入的就是context对象
const Article = (props, { store }) => {
    const { article } = props;
    const author = store.findAuthor(article.authorId);
  	// jsx...
}
Article.ContextTypes = {
    store: PropTypes.object
};
```

## shallow rendering from enzyme

这时候jest测试应该是失败的，因为这时候的Article组件时依赖全局变量context的，但我们在测试ArticleList时，依赖的组件Article并不能获取这个变量。这时候有两种方法，一种是fake这个变量，另一种是使用shallow rendering。这里更推荐后者，是因为我们针对组件做的是单元测试，单元测试应该减少对外界的依赖。与tree rendering不同，shallow rendering不会渲染当前测试组件中引用的其他组件，所以就不会发生Article组件依赖全局对象context的情况，也更符合单元测试的初衷。我们使用enzyme模块帮助完成shallow rendering。

```jsx
// lib/components/__tests__/ArticleList.test.js
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// 最先版本的Enzyme必须要进行初始化配置，而且要选择所使用react对应的版本，这里使用的react版本是16.1.1
Enzyme.configure({ adapter: new Adapter() });
// inside the test case
const wrapper = shallow(<ArticleList {...testProps } />);
expect(wrapper.find('Article').length).toBe(2);
expect(wrapper).toMatchSnapshot();
```

## presentational component VS container component

**我们应该避免使用之前提到过的context API**。首先，context本质上是一个全局变量，这种东西自然是能避免则避免；其次，我们在之前的测试中已经发现了context API给测试带来的问题了。如果我们要测Article组件，即使是shallow rendering也没办法了。暂时解决测试Article组件的方法是将Article组件拆分为两个，一个container component，一个presentational component。前者负责将数据从context中拿出，并传递给后者，后者只负责展示数据。这样测试container时可以使用shallow rendering，测试presentational组件时，不依赖context，两全其美。

```jsx
// lib/components/Article.js
const ArticleContainer = (props, { store }) => {
    return <Article {...props} store={store} />;
};
ArticleContainer.contextTypes = {
    store.PropTypes.object
};
const Article = (props) => {
    const { article, store } = props;
}
export default ArticleContainer;
```

为了使测试通过应该讲验证ArticleList子元素个数的判断改为

```js
expect(wrapper.find('ArticleContainer').length).toBe(2);
```



## higher order component

鉴于上面这种将一个组件拆分为智能组件和木偶组件的方式很常见，我们可以用一个一般化的函数来实现将一个组件拆分为两个组件（或者将木偶组件升级为智能组件）的功能。这种函数被称作高阶组件。

```jsx
// lib/components/storeProvider.js
import React from 'react';
import PropTypes from 'prop-types';

const storeProvider = (OriginalComp) => {
    return class extends React.Component {
        static displayName = `${OriginalComp.name}Container`;
  	    static contextTypes = {
            store: PropTypes.object
        };
  	    render() {
            return <OriginalComp {...this.props} store={this.context.store} />;
        }
    };
};
return storeProvider
```

```js
// lib/components/Article.js
import storeProvider from './storeProvider';
// remove all the implementation of ArticleContainer
export default storeProvider(Article);
```

## map props

现在唯一美中不足的是在Article中还需要调用store.findAuthor()方法去获取作者信息。最好的状态使Article得props中直接包含author信息，拿来就用。

```js
// lib/components/Article.js
const {article, author} = props;
// remove const author = store.findAuthor(props.article.authorId);

// outside the component expression
function extraProps(store, originalProps) {
    return {
        author: store.findAuthor(originalProps.article.authorId)
    };
}

export default storeProvider(extraProps)(Article);
```

```jsx
// lib/components/storeProvider.js
const storeProvider = (extraProps) => (OriginalComp) => {
    // inside the class-based component
  	render() {
        return <OriginalComp {...this.props} {...extraProps(this.context.store, this.props)} />;
    }
};
```

# 订阅state

## setState & debounce

这里我们添加一个search输入框用来过滤文章信息。这里我们使用了受控组件来处理用户的输入，并通过lodash的debounce功能来延迟处理用户的输入（即不必用户每输入一个字母就执行对应的操作，如发送请求等）。

```jsx
// lib/components/SearchBar.js
import React from 'react';
import debounce from 'lodash.debounce';

class SearchBar extends React.Component [
    state = {
        searchTerm: ''
    };
    doSearch = () => {
    	debounce(() => {
    		this.props.doSearch(this.state.searchTerm);
  		}, 300)
  	}
    handleSearch = (e) => {
    	this.setState({ searchTerm: e.target.value }, this.doSearch);
    }

  	render() {
    	return (
  			<div>
  				<input type="search" value={this.state.searchTerm} onChange={this.handleSearch} />
  			</div>
  		)
  	}
]
```

App组件中包含所有的信息，所以搜索过滤的操作应该是在App组件中完成的。搜索需要两个信息SearchTerm和articles。前者可以通过prop传入方法，通过回调方法传入参数获取，后者本来就在App的state中。所以我们可以直接通过这两个信息获取通过searchTerm过滤后的articles结果，并传给ArticleList组件中。

```jsx
// lib/components/App
import SearchBar from './SearchBar';
//inside the class-based component
doSearch = (searhTerm) => {
    this.setState({ searchTerm });
}
//inside the render method
render() {
   let { searchTerm, articles } = this.state;
   if(searchTerm) {
       articles = pickBy(articles, (value, key) => {
          return value.title.match(searchTerm) || value.body.match(searchTerm);
       });
   }
    return (
        <div>
            <SearchBar doSearch={this.doSeach}/>
            <ArticleList articles={articles} />
        </div>
    )
}

```

最后别忘了，我们是把获取到的searchTerm存在state中的，因此在App组件初始化的时候需要一个初始值，而这个初始值是通过state-api中的getState方法实现的。所以我们需要在stateApi中的`this.data`中添加searchTerm的初始值为空字符串。

```js
// lib/state-api/lib/index.js
this.data = {
    // original data
  	searchTerm: ''
};
```

现在通过在输入框中输入字符能够实现对显示文章的过滤，但是我们的状态管理单元感受不到这种过滤，接下来我们处理这件事。

## 通过订阅方式让state manager管理组件中的state变化

让state manager（store）来管理组件中的state，就必须要让store能够感知组件中的状态变化，在store中更新数据后还能够通知到各组件去更新UI。所以

- 首先在组件变化时，我们不在各个组件内部setState，而是调用store的方法去更新store中的数据(`this.data`)。(1)
- 然后通过订阅方式，每当store中的数据发生变化的时候都去更新订阅过store的组件去更新组件内部的数据。(2)
- 最后在组件卸载的时候还要能够取消订阅，因为我们不想在组件不存在的时候去通知这个不存在的组件更新数据。(3)

```jsx
// lib/components/App.js
// delete the doSearch Method in App component
componentDidMount() {
    this.subscribeId = this.props.store.subscribe(() => {
        this.setState(this.props.store.getState());
    });
} // (2)
componentWillUnmount() {
    this.props.store.unsubscribe(this.subscribeId);
} // (3)
// in render method
<SearchBar doSearch={this.props.store.setSearchTerm} /> // (1)
```

然后更新state-api，实现上面用到的订阅、取消订阅、更新数据、并且增加当数据改变时通知到各订阅组件的方法。

```js
// lib/state-api/lib/index.js
constructor() {
    this.subscribitions = {};
    this.lastSubscribeId = 0;
}
// 订阅
subscribe = (cb) => {
    this.lastSubscribeId ++;
    this.subscribitions[this.lastSubscribeId] = cb;
    return this.lastSubscribeId;
}
// 取消订阅
unsubscribe = (lastSubscribeId) => {
    delete this.subscribitions[lastSubscribeId];
}
// 通知订阅组件更新数据
notifySubscribers = () => {
    Object.values(this.subsribitions).forEach((cb) => cb());
}
// 更新state manager内部数据
mergeState = (newState) => this.data = { ...this.data, ...newState }
setSearchTerm = (searchTerm) => {
    this.mergeState({ searchTerm });
}
```

## 使用state-manager管理一个时钟

首先时钟组件应该是一个纯显示用组件，其显示的数据应由props传递进来。其次，时钟的值是会变化的，因此需要state-manager管理当前时间数据。

```jsx
// lib/components/App.js
<TimeStamp timeStamp={this.state.timeStamp} />
```

然后在状态管理单元中提供对这个数据的管理。

```js
// lib/state-api/lib/index.js
constructor() {
    this.data = { timeStamp: new Date().toString() };
    setInterval(() => {
        this.setTimeStamp();
    }, 1000)
}
setTimeStamp(timeStamp) {
    this.mergeState({ timeStamp });
}
```

这时候刷新页面会发现console中会报一个warning。大概意思是说服务端渲染的时间和浏览器端不一致。这是自然的，服务端渲染发生在前，浏览器渲染发生在后，我们的计时是从服务端渲染开始的，所以二者会不一致。解决办法将开始计时的时机放在浏览器端渲染完成时就好了。

```js
`warning.js?6327:33 Warning: Text content did not match. Server: "Sat Nov 25 2017 11:13:17 GMT+0800 (CST)" Client: "Sat Nov 25 2017 11:13:18 GMT+0800 (CST)"`
```

```js
// lib/state-api/lib/index.js
// delete the setInterval Expression
startClock = () => {
    setInterval(() => {
        this.setTimeStamp(new Date().toString())
    }, 1000);
}
```

```js
// lib/components/App.js
componentDidMount() {
    this.props.store.startClock();
}
```

刷新，warning不见了呢！

## timestamp ticking without props passed by App

现在TimeStamp组件时通过props接收来自App组件获取的state信息来展示数据的。但是我们之前已经体验了通过高阶组件直接获取store中数据的方式来避免store数据在组件间的传递。这里我们故技重施。

```js
// lib/component/TimeStamp.js
import storeProvider from './storeProvider';
function extraProps(store) {
    return {
        timeStamp: store.getState().timeStamp
    };
}
export default storeProvider(extraProps)(TimeStamp);
```

这时，在App组件中就不需要显式传递timeStamp参数勒。

```jsx
// lib/components/App.js
<TimeStamp />
```

这时候在时间变化的过程中，不管是TimeStamp还是TimeStampContainer的props和state都没有变化，之所以数据能够渲染出来，是因为AppComponent重新渲染了（因为App组件订阅了store，当store中的timeStamp变化的时候，会通过调阅回调函数重新给App setState），所以其子组件也重新渲染，重新渲染时，TimeStampContainer重新获取store中的值（通过extraProps），然后把最新的值渲染出来。但是如果我们把container设置为PureComponent（也就是这种组件当props和state都不改变的时候是不会重新渲染的，即使父组件重新渲染了），那我们在页面上看到的时钟就不会走字儿了。

```js
// lib/components/storeProvider
return class extends React.PureComponent {
```

container组件是能够直接访问store中的信息的，所有当store中的数据改变的时候，container都有权知道并作出相应的改变，这样container才能对store中的数据变化作出动态响应。所以还是老样子，让storeProvider中生成的container组件订阅store，然后store变化时，强制container组件重新渲染（重新调用render函数，在render函数中通过extraProps重新获取store中的数据，并将其映射到子组件的props上）。

```js
// lib/components/storeProvider.js
onStoreChange = () => {
    this.forceUpdate();
}
componentDidMount() {
    this.subscribeId = this.context.store.subscribe(this.onStoreChange);
}
componentWillUnmount() {
    this.context.store.unsubscribe(this.subscribeId);
}
```

## 重构

之前我们在App中显式地给searchBar传入了doSearch的参数，其中调用了store的setSearchTerm方法。现在我们把searchBar包装成一个container，这样它就可以直接访问store中的方法，不需要我们再显式传入这个参数了。

```jsx
// lib/components/App.js
<SearchBar />
```

```js
// lib/components/SearchBar.js
import storeProvider from './storeProvider';
// inside the class-base component
doSearch = debounce(() => {
    this.props.store.setSearchTerm(this.state.searchTerm)
}, 300);
// at last
export default storeProvider()(SearchBar)

```

修改storeProvider，使其extraProps为一个可选参数

```jsx
// lib/components/storeProvider
const storeProvider = (extraProps = () => ({})) => (OriginalComp) => {
    // inside the return class-based component
  	render() {
        return <OriginalComp
                 {...this.props}
                 {...extraProps(this.context.store, this.props)}
                 store={this.context.store} />
    }
}
```

接下来修改搜索的逻辑，使其对搜索的关键字大小写不敏感。

```js
// lib/components/App.js
const searchRe = new RegExp(searchTerm, 'i');
    if (searchTerm) {
      articles = pickBy(articles, (value) => {
        return value.title.match(searchRe) || value.body.match(searchRe);
      });
    }
```

这时候刷新页面，搜索，会发现有一个warning

```js
`Can only update a mounted or mounting component. This usually means you called setState, replaceState, or forceUpdate on an unmounted component. This is a no-op.`
```

这主要是因为我们在storeProvider中使用了forceUpdate，但是当container已经被卸载的时候，store变化时依然会forceUpdate这个container。其实我们只需要增加一个flag，让他在卸载后不再forceUpdate就行了。

```js
// lib/componnets/storeProvider.js
onStoreChange = () => {
    if(this.subscribeId) {
        this.forceUpdate();
    }
}
componentWillUnmount = () => {
    this.context.store.unsubscribe(this.subscribeId);
  	this.subscribeId = null;
}
```

OK，warning不见了。

## 升级包

```sh
yarn upgrade-interactive
```

该命令会列出所有要升级的包的名称及详情，只需要选择哪个要升级就可以了。

# 性能优化

## 跟update有关的几个声明周期函数

- `componentWillReceiveProps(nextProps)` 每次父组件重新渲染时，子组件的这个函数就会被调用，其参数为父组件渲染后子组件新的props，即使新的props没有变化，也会调用这个函数。但是这个函数调用并不意味着该组件就会被重新渲染。如果自组件的state被重新设置了，这个函数不会被调用，但是组件却是被重新渲染了。所以对于性能优化来说，这个函数关系不大。
- `shouldComponentUpdate(nextProps, nextState)`返回ture/false，如果返回false，对于pure Component来说就不会重新渲染。我们在某些场合通过这个函数避免组件一些不必要地重新渲染。
- `componentWillUpdate(nextProps, nextState)`在组件重新渲染之前调用，如果组件不渲染，这个函数压根儿不会调用。也就是说，我们可以在这个函数中检验组件有没有被重新渲染。举个栗子，在SearchBar组件中增加这个钩子函数，看在SearchBar组件被重新渲染了没。

```js
// lib/components/SearchBar.js
componentWillUpdate() {
    console.log('updating');
}
```

增加这段代码后发现，在正常情况下，SearchBar是会被重新渲染的。这是因为每一秒钟，store中的数据就会发生变化，因为storeProvider订阅了store，所以SearchBarContainer中的onStoreChange就会被调用，也就是会触发forceUpdate，所以SearchBar作为其子组件也被重新渲染了。这显然是不必要的。因为SearchBar在正常情况下，是没有状态或者prop的改变的，重新渲染是在浪费感情。

为了避免这种情况发生，我们可以使用`shouldComponentUpdate`钩子函数判断当前state和props跟之前的是否一样，如果一样直接返回false就行了。这正是React中Pure Component做的事情，因此我们只需要将SearchBar改为这样就可以了。

```js
// lib/components/SearchBar.js
class SearchBar extends React.PureComponent {
    // implementation
}
```

这时候SearchBar就不会随着时钟重新渲染了。这给出了一个最佳实践：**能用pure component就用pure Component**。但是Pure Component有一个问题是，**其在shouldComponentUpdate中比对新老state和props时，采用的是浅层比对，如果组件中的数据结构比较深，那么Pure Component可能不会在该更新的时候更新。比较保险的方式是通过immutable.js维护组件内数据**。[参考](https://reactjs.org/docs/react-api.html#reactpurecomponent)

## 性能测量

在chrome调试工具下有一个Performance选项卡，其中记录了有关性能的一切指标。你也可以通过在域名后面增加`?react_perf`来查看有关react各个组件渲染时间的详细信息，如下图所示：

![](https://ws1.sinaimg.cn/large/006tNc79gy1flvbjub7ebj31kw0r30yf.jpg)



## 使用react-addons-perf测量性能并给出优化标识

React-addons-perf插件在React16中已经不再支持，但是官方表示后期会给出新的版本用于支持React16.以下所有实现均是基于react15.4。

![](https://ws2.sinaimg.cn/large/006tNc79gy1flvehriwvoj31kw03f0u9.jpg)

### 引入perf

```js
// lib/components/App.js
import Perf from 'react-addons-perf';
if(typeof window !== 'undefined') { // 在服务端渲染时是没有window对象的
    window.Perf = Perf;
}
```

## 开始测量

通过在组件生命周期中插入代码，可以保证我们每次测量的时候都针对的是同一目标，这样也便于我们在优化前后优化后进行对比。

```js
// lib/components/App.js
componentDidMount() {
    setImmediate(() => Perf.start());
    setTimeout(() => {
        Perf.stop();
        Perf.printWasted();
    }, 5000);
}
```

刷新页面，等待5s，就可以在控制台中看到这5s里有哪些浪费感情的操作。

![](https://ws3.sinaimg.cn/large/006tNc79gy1flvezaft2ij319y07y40b.jpg)

ArticleList和ArticleContainer被浪费感情地重新渲染了25次。

App被浪费感情地渲染了5次。

这里面所有container被重新渲染是可以被理解的。因为每次store更新的时候，所有的container都因为订阅了state，所以被forceUpdate了。

但是这里发现ArticleList也被重新渲染了，这就很坑爹了，因为在计时器计时的过程中，文章列表根本没有必要重新渲染。通过观察ArticleList，我们可以发现这是一个functional组件，react不会对functional组件进行优化，所以只要其父组件重新渲染，functional的子组件一定会被重新渲染的。

针对这个问题有两种解决方案：

- 在父组件中以函数的形式而非组件实例化的形式调用functional子组件。按照如下代码所示修改App组件的render函数，刷新发现ArticleList的垃圾渲染没有了耶。但是这样做有一个弊端，就是这里ArticleList就不是一个React组件了，当我们调用React开发者工具查看的时候，是找不到ArticleList组件的。

  ```jsx
  {ArticleList({ articles })}
  {/* <ArticleList
  	articles={articles}
      /> */}
  ```

  ![](https://ws4.sinaimg.cn/large/006tNc79gy1flvfjvdnidj313k06wgmy.jpg)

  ![](https://ws2.sinaimg.cn/large/006tNc79gy1flvflvbqhij30sg0di77w.jpg)

- 为了在不丢失组件表现形式的同时提高性能，我们就只能采用class-based component了。使用PureComponent重写ArticleList后，在App组件中依然按照react组件的形式实例化，发现ArticleList的垃圾渲染没有了，同时在调试工具中还能看到ArticleList的组件。 这再次证明了一个真理，**能用Pure Component就用Pure component**

- 或者使用高阶组件对functional组件进行优化。如果使用react-redux之类的库，在对函数式组件进行封装的时候会自动使用Pure Component，所以这个时候就不用再手动优化函数式组件了。

使用上述方法，对Article组件进行同样的处理，发现Article的垃圾渲染也没有了呢。

![](https://ws4.sinaimg.cn/large/006tNc79gy1flvg8dkic9j31jc06i0u6.jpg)

除了container外，这时候还剩下App组件被无故重新渲染了。我们把App组件也改为Pure Component，发现并没有起作用，这就要进一步去发现为啥App组件会被无故渲染。通过观察App的实现我们发现，当store改变时，App组件会重新获取store中的数据，并重新setState，正是这里的setState引起了App的重新渲染。但是在App组件中真正需要store中的数据只有两个，articles和searchTerm。所以我们应该只有当store中这两部分改变的时候，才让App组件重新渲染。刷新页面，看控制台，这样做是有效的。

```js
// lib/components/App.js
shouldComponentUpdate(nextProps, nextState) {
    return (nextState.articles !== this.state.articles || nextState.searchTerm !== this.state.searchTerm);
}
```

![](https://ws3.sinaimg.cn/large/006tNc79gy1flvgmgjtz7j31ju05275k.jpg)

但是这种方法有一个弊端，就是如果以后再更新项目时，App中使用的state多了一个，那我们也要在shouldComponentUpdate中补上这个，维护起来比较麻烦。解决这个问题的终极办法，是只把App组件用的变量挂到state上。注意这里一定要用Pure Component，只有这样才会在检测到setState前后state值没有发生变化，然后不重新渲染这个组件。搞完之后，发现跟上边是一样的结果。

```js
// lib/components/App.js
class App extends React.PureComponent {
    appState = () => {
      const {articles, searchTerm} = this.context.store.getState();
      return {articles, searchTerm};
    }
    componentDidMount() {
        this.subscribeId = this.props.store.subscribe(() => {
          this.setState(this.appState());
        });
    }
	// delete shouldComponentUpdate
}
```

这给我们一个启示，**当把一个组件connect到container上时，每次只获取组件需要的那部分数据作为state，不要全部都放在state上**。

接下里我们要集中注意力把container中所有的垃圾渲染给干掉。还记得之前，我们在创建每个container时，都订阅了store，并且在store变化时，forceUpdate。当然，我们不能forceUpdate，而是重新渲染，只有当这个container所装的组件需要的那部分数据变化时，才重新渲染。怎样才能知道各个container需要哪些数据呢，extraProps函数！这个函数返回的值，正好是被包裹的组件所需要的数据。

```js
// lib/components/storeProvider.js
usedState = () => {
    return extraProps(this.context.store, this.props);
}
state = this.usedState(); // 这里要给所有的container的state一个初始值，否则默认初始值为null，从null->初始值还是有一次不必要的渲染
onStoreChange = () => {
    if (this.subscribeId) {
        this.setState(this.usedState);
    }
}
```

这样之后，所有的垃圾渲染都被干掉了。

![](https://ws1.sinaimg.cn/large/006tNc79gy1flvi4n54a3j31go02cglo.jpg)

github上有个包，[why-did-you-update](https://github.com/maicki/why-did-you-update)。使用这个包时，当你的组件进行不必要地重新渲染时，它会在console中提醒你，并告诉你是在什么时候进行不必要地重新渲染了。

![](https://camo.githubusercontent.com/0f34a575ad3f81c9826f54c03a17da848e1ee038/687474703a2f2f692e696d6775722e636f6d2f556938595542652e706e67)

## immutable state

假如我们在state-api中增加如下逻辑，在初始值设定后，经过某段时间，给初始data的articles中增加一个article（比如通过ajax请求），我们用如下的逻辑模拟这个行为。

```js
// lib/state-api/lib/index.js
// inside the constructor
setTimeout(() => {
  const newArticle = {
    ...rawData.articles[0],
    id: 'fakeArticleId'
  };
  this.data.articles[newArticle.id] = newArticle;
  this.notifySubscribers();
}, 1000);
```

但是刷新页面，发现这个新的Article并没有显示出来。这是因为对于pure Component来说，state中的articles的引用（内存中的地址）并没有改变，所以并不会重新渲染。也就是说**mutable的data并不会引起Pure Component的重新渲染**。如果引用store中的数据的组件不是Pure Component，数据mutate后，UI是能够渲染的。但是前面已经提到了Pure Component的种种好处了，所以我们还是要用pure Component的，那我们只能采用immutable的形式改变store中的数据，如下所示：

```js
// lib/state-api/lib/index.js
this.data = {
  ...this.data,
  articles: {
    ...this.data.articles,
    [newArticle.id]: newArticle
  }
};
// this.data.articles[newArticle.id] = newArticle;
```

这时候，store中的data跟之前就不是同一个data了，所以pure component应该会对新的data重新渲染。但是显然，这么写比之前要复杂很多，幸运的是有很多immutable修改数据的库，像[immutable.js](https://facebook.github.io/immutable-js/)，可以使我们以immutable的方式更新数据变得更加简单。

# Deployment

## 分离bundle.js

目前我们所有的js都打包成一个单独的文件`public/bundle.js`，有一个坏处是，我们经常更新我们的代码，但是依赖的库却是不经常更新的，每次我们更新完自己的代码后，用户要被迫清除缓存，重新下载所有的代码。更好的做法是把我们打包出来的所有代码分成两个部分`vendor.js app.js`，前者存放所有依赖的库，后者存放我们自己写的代码。我们通过引入webpack的CommonsChunkPlugin来解决这个问题。首先修改webpack配置文件，使其在打包过程中能够拆分文件：

```js
// webpack.config.js
entry: {
    vendor: [
      'babel-polyfill',
      'react',
      'react-dom',
      'prop-types',
      'axios',
      'lodash.debounce',
      'lodash.pickby',
    ],
    app: ['./lib/renderers/dom.js']
  },
// entry: ['babel-polyfill', path.join(__dirname, 'lib', 'renderers', 'dom.js')],   
output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js'
  },
plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    })
  ]
```

然后在ejs中引入这两个文件：

```ejs
<script type="text/javascript" src="/vendor.js"></script>
<script type="text/javascript" src="/app.js"></script>
```

接下来应该减少打包文件的大小，目前两个打包出来的文件大小如下所示：

![](https://ws4.sinaimg.cn/large/006tNc79gy1flvkza9ar2j30lq05wq3v.jpg)

在package.json的script部分增加如下的命令：

```json
"build": "webpack -p",
```

通过`yarn build`打包出来的文件打下如下：

![](https://ws4.sinaimg.cn/large/006tNc79gy1flvl1osn93j30la05q0tj.jpg)

## build for node

首先应该在package.json中增加一条专门用于编译node项目的命令

```js
"build-node": "babel lib -d build --copy-files",
```

`--copy-files`选项意思是如果目标文件夹中有不是js的文件，复制过来就行。

然后配置package.json中的babel选项，使该配置只对node项目有效。

```json
"babel": {
    "presets": [
      "react",
      ["env", { "targets": { "node": "current" } }]
    ],
    "plugins": [
      "transform-class-properties",
      "transform-object-rest-spread"
    ]
  },
```

最后还要修改webpack的配置，使其babel配置覆盖掉上边的配置，以进行浏览器端的编译

```js
rules: [
      {
        exclude: /node_modules/,
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', 'env', 'stage-2']
          }
        }
      }
    ]
```

## 多个node进程运行在不同的CPU内核上

如果机器是多核的，为了尽可能地利用机器的性能，我们需要在多个核上启动node进程。node有一个cluster模块可以完成这项工作。但是我们可以使用pm2来使这项工作变得非常简单，仅仅在使用pm2命令启动服务时，增加一个`-i max`就行了。在package.json中增加一个在生产环境中启动server的命令。

```json
"dev": "NODE_PATH=./lib pm2 start lib/server.js --watch --interpreter babel-node --name appDev",
"prod": "NODE_ENV=production NODE_PATH=./build pm2 start build/server.js -i max --name appProd",
```

通过`yarn prod`可以看到在机器的所有核上都启动了node进程。
