# Clone processon

NodeJS 版在线流程图，模仿 https://www.processon.com/

> 本项目仅供学习使用

## 技术栈

- 后端: [express.js](https://expressjs.com/)
- 数据库: [postgres](http://www.postgres.cn/docs/12/)
- ORM: [prisma](https://prisma.io/)
- Authentication: [github OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- 前端: [Jquery](https://jquery.com/)

## 部署

- 没有装 postgresql 可以使用 `docker-compose.yml` 启一个容器服务

```
docker-compose up -d
```

- 复制 .env.example 命名为 .env

```
# 数据库链接地址
DATABASE_URL="postgresql://admin:example@localhost:5432/pro?schema=public"

# JWT 秘钥
JWT_SECRET="JWT_SECRET"

# 邮箱验证
# 返回域名
DOMAIN="http://localhost:3000"
# 邮箱
EMAIL_USER="maqi1520@163.com"
# 邮件发送人
EMAIL_USER_NAME="狂奔的小马"

# 邮件smtp
EMAIL_HOST="smtp.163.com"
# smtp 密码 并非邮箱密码，在邮箱设置中申请
EMAIL_PASS="xxxxxx"
# github oauth 参数
GITHUB_CLIENT_ID="xxxxxxxxxx"
GITHUB_CLIENT_SECRET="xxxxxxxxx"
```

- 安装依赖

```
yarn install
```

- 打包

```
yarn build
```

- 启动

```
yarn start
```

## TODO

- ✅ 支持 POS 文件导入
- [ ] websocket 多人同步编辑
- [ ] 文件上传
- [ ] 生成缩略图
- [ ] 分享页面

## 联系

备注来源

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a856f92420f485cba31fe5a8ee01511~tplv-k3u1fbpfcp-watermark.image?)

## 我的微信公众号

定位前端工程师进阶

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f1484497c4f647cc87aeb5f746f220de~tplv-k3u1fbpfcp-watermark.image?)
