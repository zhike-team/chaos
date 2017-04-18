<!-- MarkdownTOC -->

- [选校帝后端项目框架](#选校帝后端项目框架)
  - [初次使用](#初次使用)
    - [Step 1. 安装](#step-1-安装)
    - [Step 2. 配置](#step-2-配置)
    - [Step 3. 数据库初始化](#step-3-数据库初始化)
    - [Step 4. 启动服务](#step-4-启动服务)
  - [代码目录说明](#代码目录说明)
  - [模块说明](#模块说明)
    - [常用对象 \(common\)](#常用对象-common)
    - [路由](#路由)
    - [API服务](#api服务)
      - [响应](#响应)
    - [模型](#模型)
      - [Schema](#schema)
      - [Model Methods](#model-methods)
      - [Migrations](#migrations)
    - [中间件](#中间件)

<!-- /MarkdownTOC -->

# 选校帝后端项目框架

（项目由zhike-chaos脚手架工具生成）



## 初次使用

### Step 1. 安装

安装依赖：

```bash
npm install
```

### Step 2. 配置

首先打开 src/common/config.js 和 src/common/config.db.js，配置服务属性和数据库连接属性。

>   从git clone过来的项目没有上述两个文件，则需要从example文件拷贝
>
>   -   src/common/config.example.js -> src/common/config.js
>
>
>   -   src/common/config.db.example.js -> src/common/config.db.js

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



### Step 3. 数据库初始化

1. **如果是新的项目，则需要先定义好表结构**: 运行`npm run migration:create`，找到在 src/models/migrations 中新建的文件，在里面填写数据模型创建以及撤销的逻辑。
2. **如果要向一个空的数据库中同步表结构**: 运行`npm run migrate`，执行刚刚定义好的migration操作。

> 数据模型变更也遵循相同步骤



### Step 4. 启动服务

```bash
# 方式1：开发模式的启动 (watch模式)
supervisor index.js

# 方式2：简易守护进程
forever index.js

# 方式3：带进程管理的启动
pm2 start index.js --name <name: 以此名称在pm2中称呼此项目>

# 直接启动
node index.js
```




## 代码目录说明

- **bin/**: 存放加载、预处理类脚本
- **src/**
- **common/**
  - **cache.js**: 缓存服务，[redis client](https://github.com/NodeRedis/node_redis)
  - **config.db.js**: 数据库连接配置
  - **config.js**: 其他项目配置
  - **constants.js**: 枚举等常量
  - **db.js**: 数据库服务，[Sequelize client](https://github.com/sequelize/sequelize)
  - **errors.js**: API错误代码
  - **Exception.js**: 用于程序中抛出逻辑错误，new Exception(code, msg)
  - **index.js**: 包含common中的所有模块，为对象解构赋值提供便利。
  - **models.js**: 包含所有的[models模块](#模型)
  - **oss.js**: [阿里云OSS服务](https://github.com/aliyun-UED/aliyun-sdk-js)
  - **schemas.js**: 包含所有的schema
  - **services.js**: 包含所有的[services模块](#API服务)
- **lib/**
  - **middlewares/**: 定义中间件，每个module导出为Express中间件函数（`function(req, res, next)`）
  - **express.js**: express App对象，加载了常用中间件，其他中间件请在 src/server/index.js 中加载
  - **funcs.js**: 全局工具函数
  - 还有其它非第三方依赖库。
- **services/**: 定义API服务逻辑，[下面详述](#API服务)。
- **models/**:
  - **methods/**: 定义模型层方法，导出包涵模型方法的Object。[下面详述](#模型)。
  - **migrations/**: 定义数据库模型。
  - **schemas/**: 数据模型定义，通过`npm run sync`同步得到，不需要自己写。
- **routes/**: 定义路由规则，[下面详述](#路由)。
- **server/**: 定义服务相关脚本。
- **test/**: 存放测试代码
- **index.js**: 项目入口文件
- **package.json**: Node.js包描述文件
- **README.md**: 项目说明文件。




## 模块说明



### 常用对象 (common)

项目里面有一些常用对象，在编写过程中可能经常用到。


```js
// 共用数据及工具
config       // 项目配置，定义在 src/common/config.js 中
config.db    // 数据库配置，定义在 src/common/config.db.js 中
constants    // 枚举、常量，定义在 src/common/constants 中
errors       // API错误代码，定义在 src/common/errors.js 中
Exception    // API错误类，用于创建一个API错误。例子：new Exception(1, 'Ouch!');
funcs        // 工具函数，定义在 src/lib/funcs.js 中

// 第三方服务
db           // sequelize instance
Sequelize    // sequelize library
oss          // aliyun oss
cache        // redis client

// 模块引用
services     // API服务
models       // 模型
schemas      // 模型定义

// 引入方法

// 1. require('common/xxx')
const db = require('./path/to/common/db');
const oss = require('./path/to/common/oss');

// 2. require('common').xxx
const config = require('./path/to/common').config;
const { errors, Exception } = require('./path/to/common'); // >= Node.js 6.0.0

// 3. services, modals可以通过对应的文件夹路径引入
const services = require('./path/to/services');
const models = require('./path/to/models');
```



### 路由

在 src/routes 中定义路由。

每个文件为一个路由模块，文件名为`<模块名>.js`，可以用文件夹划分。

例子：

```js
// user.js
module.exports = router => {
  router.post('/login', services.user.login);
  router.post('/register', services.user.register);
  router.put('/personal/info', services.updatePersonalInfo, {multipart: true});
};

// index.js
module.exports = router => {
  router.use('/user', require('./user'));
}

// 定义了如下路由
POST /user/login
POST /user/register
PUT /personal/info (且参数以multipart的方式传递)
```

> 路由规则：
>
> ```markdown
> router.<METHOD>(<PATH>, <ACTION>, <OPTIONS>)
>
> - METHOD:    string, HTTP方法，如：GET, POST, PUT, DELETE
> - PATH:      string, 路由的路径，以'/'开头，可以子路由嵌套
> - ACTION:    string, 对应的处理函数，要是generator function
> - OPTIONS:   object?, 预处理配置项
> ```



> 可用的配置项（options）：
>
> - **raw**: *boolean* － 是否跳过请求预处理（不跳过其它中间价），直接进入action，适用于从纯Express项目中导入的控制器。
> - **cache**: *boolean* － 是否缓存。（在config.js中配置cache.time来控制缓存过期时间）
> - **multipart**: *boolean* － 以multipart方式读取参数，当需要传递文件时会用到。



### API服务

在 src/services 中定义API服务。

每个文件为一个API服务模块，文件名为`<API模块名>.js`，模块要导出为一个类。每个类会被实例化并加载到services对象里如：

```
user.js -> services.user
bookStore.js -> services.bookStore
```

> API服务模块文件不能使用`<API模块名>/index.js`的结构。

例如一个简单的user服务：

```js
// user.js
// >= node.js 6.0.0
const { models, Exception } = require('../common');
// for node.js 4.x.x, 5.x.x
const models = require('../models');
const Exception = require('../common/Exception');

module.exports = class UserService {
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

要引用API服务，使用services对象，该对象包含所有的API服务模块。

services对象的几种引入方法：

```js
// 需要 node.js 版本在 6.0.0 之上
const { services } = require('./path/to/common');

// 直接引入services文件夹（比较直观）
const services = require('./path/to/services');

// 引入common中的services
const services = require('./path/to/common/services');

// 引入common对象，取其中的services
const services = require('./path/to/common').services;
```

#### 响应

> 以下为`options.raw`（见[路由](#路由)）未开启的情况。

1、Action函数如果成功返回，则将如下对象转化为JSON并响应：

```js
{
  code: 0,
  data: responseData, // 即service方法的返回值
}
```

2、Action函数预处理和执行过程中抛出了错误，则将错误转化为JSON并响应：

```js
{
  code: config.errPrefix + err.code || 1, // 例如：PREFIX_2
  msg: err.msg // common/errors.js 中定义的错误名或构造Exception时指定的值，如果都没有指定，则显示"未知错误"
}
```



### 模型

模型定义在 src/models 中。

模型的定义分为 schema 和 class methods。schema 定义一个模型的结构，class methods 定义一个模型的行为。

要引用模型，使用models对象：


```js
// 用析构赋值引入common对象, 需要 node.js 版本在 6.0.0 之上
const { models } = require('./path/to/common');

// 直接引入models文件夹（比较直观）
const models = require('./path/to/models');

// 引入common中的models
const models = require('./path/to/common/models');

// 引入common对象，取其中的models
const models = require('./path/to/common').models;
```

#### Schema

Schema 文件由 `npm run sync` 生成，是将数据库中的模型同步下来的产物，不需要自己修改。



#### Model Methods

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
  return yield this.findOne({
    where: {id},
  });
};
```



#### Migrations

数据库的创建和变更需要通过[Migrations](http://docs.sequelizejs.com/en/latest/docs/migrations/)来实现。具体写法参照[文档](http://docs.sequelizejs.com/en/latest/docs/migrations/)。

这里给出操作步骤。

每当数据库需要变更时，用

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

第三方中间件直接按照需要的顺序加进去。

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
