<!-- MarkdownTOC -->

- [Chaos](#chaos)
  - [用法](#用法)
    - [主要命令](#主要命令)
    - [模板参数](#模板参数)
    - [帮助](#帮助)
  - [模板](#模板)
    - [现有模板](#现有模板)
    - [制作模板](#制作模板)

<!-- /MarkdownTOC -->


# Chaos

项目脚手架生成器

用CLI的方式快速构建项目脚手架

```bash
chaos node-api scadmin # 在当前目录下建立名为"scadmin"的Node.js API服务项目
chaos node-api --version 1.2 ssadmin # 在当前目录下以1.2版本的模板建立名为"ssadmin"的项目
chaos node-api ssadmin -a port=8000 # 以默认监听8000端口建立项目
```

## 用法

首先全局安装

```
npm install -g zk-chaos
```

如果要在 projects 目录下建立 node.js API 项目 coconut ：

```bash
cd projects
chaos node-api coconut
```

### 主要命令

```bash
chaos -l # 列出所有模板和版本
chaos <template> -v <version> <name> # 按指定版本的模板创建项目
chaos <template> <name> -a <args> # 传递参数给模板
```

### 模板参数

模板参数用以`,`分隔的querystring格式传给chaos，例如：

要传递以下参数：

- port = 3000
- css = less

则需要这么写：

```bash
chaos <template> <name> -a port=3000,css=less
```

> 所有参数均解析为string，类型转换可以在模板中做。

### 帮助

程序帮助如下，可以用`chaos -h`或`chaos --help`查看：

```

Usage: chaos <template> [options] <name>

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -v, --template-version <version>  specify template version (defaults to newest)
    -a, --template-args <args>        args pass to template (example: --args port=3000,css=less)
    -l, --list                        list all templates

  Examples:

    $ chaos node-api myapp
    $ chaos node-api -v 1.1 myapp
    $ chaos node-api -v 1.1 myapp -a port=3000,css=less

  Template Arguments:

    port        the port for the template

```

## 模板

### 现有模板

- node-api
  - 1.0 (default)

### 制作模板

首先准备好脚手架。

将需要模板化的文件加上后缀 `.template`:

```
package.json -> package.json.template
```

然后在模板中使用[ejs](https://github.com/mde/ejs)编写模板逻辑。如下：

```js
// package.json
{
  "name": "boilerplate",
  "version": "1.0.0",
  ...
}

// package.json.template
{
  "name": "<?= name ?>",
  "version": "1.0.0",
  ...
}

// render with project name = coconut
{
  "name": "coconut",
  "version": "1.0.0",
  ...
}
```

> 为了防止和模板项目中可能存在的ejs文件冲突，我们使用 `<? ?>` 作为模板符号。

准备好模板后，起一个模板名（如：palm），将其放入chaos的templates文件夹中：

```
.../new_boilerplate/ -> chaos/templates/palm/1.0/
```

之后每更新版本，便添加一个以版本命名的文件夹放新版本的文件。
