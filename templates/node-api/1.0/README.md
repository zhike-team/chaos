<!-- MarkdownTOC -->

- [Node API](#node-api)
  - [开始之前](#开始之前)
  - [开始使用](#开始使用)
    - [1. 配置](#1-配置)
    - [2. 数据库初始化](#2-数据库初始化)
    - [3. 启动服务](#3-启动服务)
    - [4. 在新的环境部署](#4-在新的环境部署)
  - [目录说明](#目录说明)
  - [模块说明](#模块说明)
    - [全局对象](#全局对象)
    - [路由](#路由)
    - [API服务](#api服务)
      - [响应](#响应)
    - [模型](#模型)
      - [Schema](#schema)
      - [Class Methods](#class-methods)
      - [Migrations](#migrations)
    - [中间件](#中间件)

<!-- /MarkdownTOC -->


# Node API

## 开始之前

安装依赖：

```bash
npm install
```

## 开始使用

### 1. 配置

首先打开 src/common/config.js 和 src/common/config.db.js，配置服务属性和数据库连接属性。

主要配置项如下：

```js
// config.js
{
  name: 'chaos',          // 项目名
  port: 3000,             // 监听端口
  timeout: 20,            // 请求超时时间
  pageSize: 20,           // 默认每页显示数量
  errorPrefix: 'CHAOS_',  // 错误前缀
  cache: {                // 缓存
    host: '127.0.0.1',
    port: 6379,
    time: 60              // 缓存保持时间
  },
  oss: {                  // 阿里云
    key: 'xfVlSEfY1Wjxq8sz',
    secret: '2C2PVVVedeXWgQDH2aQKZpCru9TavL',
    endpoint: 'http://oss-cn-beijing.aliyuncs.com',
    bucket: 'hq-static',
    prefix: ''
  },
  tower: '1nMvh3jwQMaGse2xCT06lsx5AXDqpVXt'   // 秘钥，无需配置，创建时随机生成
};

```

```js
// config.db.js
{                          // 数据库连接信息
  production: {            // 固定使用production环境
    username: 'linkeo',    // 连接所使用的用户
    password: '',          // 用户的密码，没有则填空字符串
    database: 'linkeo',    // 连接的数据库
    host: '127.0.0.1',     // 数据库地址
    port: 5432,            // 数据库端口
    pool: 10,              // 连接池大小
    prefix: 'chaos_',      // 表前缀
    dialect: 'postgres'    // 数据库类型
  }
};
```



### 2. 数据库初始化

1. 如果没有命令`sequelize`，则需要全局安装一下：`npm install -g sequelize-cli`。
2. 运行`npm run migration:create`，找到在 src/models/migrations 中新建的文件，在里面填写数据模型创建以及撤销的逻辑。
3. 运行`npm run migrate`，执行刚刚定义好的migration操作。
4. 运行`npm run sync`，将完成初始化的数据库模型同步到 src/models/schemas 中。

> 数据模型变更也遵循相同步骤



### 3. 启动服务

```bash
# 方式1：开发模式的启动 (watch模式)
supervisor index.js

# 方式2：简易守护进程
forever index.js

# 方式3：带进程管理的启动
pm2 start index.js --name <name: 以此名称在pm2中称呼此项目>
```



### 4. 在新的环境部署

1. 安装：

   ````bash
   git clone <Git仓库地址> <dir: 以此名称命名项目文件夹，不写则与Git仓库同名>
   cd <dir>
   npm install
   ````

2. 配置服务属性以及数据库连接属性（见 [数据库初始化](#2-数据库初始化)）

3. 初始化数据库：运行`npm run migrate; npm run sync`将数据模型创建到新的环境并同步。

4. [启动服务](#3-启动服务)





## 目录说明

- **bin/**: 存放加载、预处理类脚本
- **src/**
    - **common/**
        - **config.db.js**: 数据库连接配置，会加载到全局`config` 的`db`属性（`config.db`）
        - **config.js**: 其他项目配置，会加载为全局`config`
        - **constants.js**: 枚举等常量，会加载为全局`constants`
        - **errors.js**: API错误代码，会加载为全局`errors`
        - **global.js**: 加载全局对象的逻辑
    - **lib/**
        - **funcs.js**: 全局工具函数，会加载为全局`funcs`
        - **middlewares/**: 定义中间件，每个module导出为Express中间件函数（`function(req, res, next)`）
        - 还有其它非第三方依赖库。
    - **services/**: 定义API服务逻辑，[下面详述](#API服务)。
    - **models/**: 定义模型层方法，导出包涵模型方法的Object。会导入各个Schema的`options.classMethods`，并生成Schema的类方法，[下面详述](#模型)。
        - **migrations/**: 定义数据库模型。
        - **schemas/**: 数据模型定义，不需要自己写。加载时会在加载完 src/models 后，生成可用的模型对象加载到全局`models`中，schema定义则加载到全局的`schemas`中。
    - **routes/**: 定义路由规则，[下面详述](#路由)。
    - **server/**: 定义服务相关脚本。
- **test/**: 存放测试代码
- **index.js**: 项目入口文件
- **package.json**: Node.js包描述文件
- **README.md**: 项目说明文件。




## 模块说明



### 全局对象

项目扩展了全局对象，以方便项目中的引用。

扩展了全局对象的以下属性：

```js
// 共用数据及工具
config       // 项目配置，定义在 src/common/config.js 中
config.db    // 数据库配置，定义在 src/common/config.db.js 中
constants    // 枚举、常量，定义在 src/common/constants 中
errors       // API错误代码，定义在 src/common/errors.js 中
Exception    // API错误类，用于创建一个API错误。例子：new Exception(1, 'Ouch!');
funcs        // 工具函数，定义在 src/common/funcs.js 中

// 第三方服务
db           // sequelize instance
Sequelize    // sequelize library
oss          // aliyun oss
cache        // redis client

// 模块引用
services     // API服务
models       // 模型
schemas      // 模型定义

// 常用工具
co
thunkify
request

// examples
if (status === constants.STATUS.NORMAL) {throw new Exception(1, '这里检查出了异常状态')}
user.password = funcs.md5(user.password);
```



### 路由

在 src/routes 中定义路由。

每个文件为一个路由模块，文件名为`<模块名>.js`，可以用文件夹划分。

例子：

```js
// user.js
module.exports = [
  ['post', '/login', controllers.user, 'login'],
  ['post', '/logout', controllers.user, 'logout'],
  ['post', '/user', controllers.user, 'register'],
  ['get', '/user', controllers.user, 'userInfo'],
  ['post', '/user/:id/follow', controllers.user, 'follow'],
  ['delete', '/user/:id/follow', controllers.user, 'unfollow']
];
```

> 路由规则：
>
> ```markdown
> [<METHOD>, <PATH>, <MODULE>, <ACTION>, <OPTIONS>]
>
> - METHOD:    string
> - PATH:      string, 以'/'开头
> - MODULE:    class, 控制器模块对象
> - ACTION:    string, 对应控制函数的名字
> - OPTIONS:   object?, 预处理配置项
> ```



> 可用的配置项（options）：
>
> - **raw**: *boolean* － 是否跳过请求预处理（不跳过其它中间价），直接进入action，适用于从纯Express项目中导入的控制器。
> - **cache**: *boolean* － 是否缓存。（在config.js中配置cache.time来控制缓存过期时间）
> - **multipart**: *boolean* － 是否获取文件类型参数，当需要接受文件时需要开启。



### API服务

在 src/services 中定义API服务。

每个文件为一个API服务模块，文件名为`<API模块名>.js`，可以用文件夹划分。如：

```
user.js -> services.user
bookStore.js -> services.bookStore
```

> API服务模块文件不能使用`<API模块名>/index.js`的结构。

例子：

```js
// user.js
module.exports = class Service {
  *login(req, params) {
    checkAccount(params.account);
    checkPassword(params.password);
    const checked = models.user.checkPassword(params.account, params.password);
    if (!checked) {
      throw Exception(4, '用户名或密码不正确');
    }
    // assume using cookie-session or other session middleware.
    req.session.user = models.user.getUserByAccount(params.account);
    return req.session.user;
  }
  *logout(req, params) {...}
  *register(req, params) {...}
  *userInfo(req, params) {...}
  *follow(req, params) {...}
  *unfollow(req, params) {...}
}
```

> `req`为Express的请求对象，`params`为整合`req.params`,`req.query`,`req.body`的一个对象，方便统一获取API参数。
>
> Action方法参数定义：
>
> ```js
> *action(req, params) => responseData
> ```
>
> - **\*action** － 以Action名命名，并且必须是一个Generator函数。
> - **req** － Express的请求对象
> - **params** － 整合了路由参数（`req.params`）、查询参数（`req.query`）和表单参数（`req.body`，如果开启了`options.multipart`还包含文件参数）的请求参数对象
> - **responseData** － 函数返回响应数据，会转化为JSON格式的字符串加入到响应体中。
>
> >   raw 选项开启时，服务接受与Express handler相同的参数`(req, res)`，但仍然需要是Generator函数。



#### 响应

> 以下为`options.raw`（见[路由](#路由)）未开启的情况。

1、Action函数如果成功返回，则将如下对象转化为JSON并响应：

```js
{
  code: 0,
  data: responseData,
}
```

2、Action函数预处理和执行过程中抛出了错误，则将错误转化为JSON并响应：

```js
{
  code: config.errPrefix + err.code || 1, // 例如：PREFIX_2
  msg: err.msg
}
```



### 模型

模型定义在 src/models 中。

模型的定义分为 schema 和 classMethods。schema 定义一个模型的结构，classMethods 定义一个模型的行为。



#### Schema

Schema 文件由 `npm run sync` 生成，是将数据库中的模型同步下来的产物。



#### Class Methods

类方法文件的名字必须与 src/models/schema 中存在的 schema 文件对应。类方法文件导出一个模型所有的类方法（类方法的写法参照[Sequelize的文档](http://docs.sequelizejs.com/en/latest/docs/models-definition/#expansion-of-models)），如：

```js
// src/models/classMethods/user.js
'use strict';

// 关联关系，模型之间的关联定义在这里。
exports.associate = function() {
  this.belongsTo(models.user, {as: 'test', foreignKey: 'id', constraints: false});
};

// 获取数据
exports.getById = function*(id) {
  let ret = yield this.findById(id);
  return ret;
};

```



#### Migrations

数据库的创建和变更需要通过[Migrations](http://docs.sequelizejs.com/en/latest/docs/migrations/)来实现。具体写法参照[文档](http://docs.sequelizejs.com/en/latest/docs/migrations/)。

这里给出操作步骤。

每当数据库需要变更时，

```bash
npm run migration:create
```

创建一个新的migration，然后在 src/models/migrations 中找到刚刚新建的文件，在里面写上migration的逻辑。

```bash
npm run migrate
```

然后执行migrate操作，将刚刚的migration应用到数据库中。

```bash
npm run sync
```

最后，执行sync操作，将最新的 schema 同步下来。



### 中间件

中间件在 src/server/index.js 中定义加载及顺序。

第三方中间件直接按照正确的顺序加进去。

自定义中间件定义在 src/middlewares 中，以中间件名为文件名，直接导出为[Express中间件函数](http://www.expressjs.com.cn/guide/using-middleware.html)。

```js
// src/middlewares/cross_domain.js
module.exports = function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
};
// src/server/index.js
app.use(require('../middlewares/cross_domain'));
```

