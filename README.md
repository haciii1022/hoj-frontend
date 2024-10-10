# hoj-frontend

## 项目说明
基于 Vue3 + Arco Design 组件库，使用 Vue-CLI 脚手架工具初始化项目。
使用 TypeScript + ESLint + Prettier + Husky 规范项目编码。
- 引入ByteMD开源Markdown文本编辑其组件，支持数学公式渲染、代码高亮等
- 基于 WebPack 整合 Monaco Editor 开源代码编辑器组件，自主封装实现Editor，支持多种代码语言高亮
- 使用 openapi-typescript-codegen 工具根据后端Swagger接口文档自动生成前端请求代码
- 基于 Vue Router 及 meta 属性配置全局导航与权限管理
### 根据后台swagger文档快速生成接口代码
```bash
openapi --input http://ip:port/api/v2/api-docs --output ./generated --client axios
```



## 项目运行
```bash
# 克隆到本地
git clone https://github.com/haciii1022/hoj-frontend.git

# 进入文件夹
cd hoj-frontend

# 安装依赖
yarn install

# 编译并热重载
yarn serve

# 发布环境
yarn build

#检查并修复文件
yarn lint
```

