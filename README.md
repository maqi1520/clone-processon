# [clone processon](https://github.com/maqi1520/clone-processon)

NodeJS 版在线流程图，模仿 https://www.processon.com/

> 本项目仅供学习使用

## 技术栈

- 后端: [express.js](https://expressjs.com/)
- 数据库: [postgres](http://www.postgres.cn/docs/12/)
- ORM: [prisma](https://prisma.io/)
- Authentication: [github OAuth](https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps)
- 前端: [Jquery](https://jquery.com/)

## 部署

安装 docker docker-compose

```yml
# Use postgres/example user/password credentials
version: "3.8"

services:
  db:
    image: postgres
    volumes:
      - pg_data:/var/lib/postgresql/data
    restart: always
    ports:
      - 5432:5432
    environment:
      POSTGRES_DB: pro
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: example

  adminer:
    image: adminer
    restart: always
    ports:
      - 8080:8080

  app:
    image: maqi1520/cloneprocesson
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://admin:example@db:5432/pro?schema=public"
      JWT_SECRET: "xxxx"
      GITHUB_CLIENT_ID: "xxxx"
      GITHUB_CLIENT_SECRET: "xxxx"
      DOMAIN: "http://localhost:3000"
      EMAIL_USER: "xxxx@163.com"
      EMAIL_USER_NAME: "xxxxx"
      EMAIL_HOST: "smtp.163.com"
      EMAIL_PASS: "xxxx"
    depends_on:
      - db
volumes:
  pg_data:
```

启动

```bash
docker-compose up -d
```

## 本地开发

- 安装 nodejs 环境
- 安装 yarn
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

- 初始化数据

```
npx prisma db seed
```

- 打包

```
yarn build
```

- 启动

```
yarn start
```

### 其他说明

Prisma 迁移: 使用 `npx prisma migrate deploy` 命令来确保数据库架构已更新。如果你在开发环境中使用了 `npx prisma migrate dev`，则在生产环境中应使用 `npx prisma migrate deploy`。

Prisma Client 生成: `npx prisma generate` 会在构建时生成 Prisma Client，确保你在应用代码中使用的 Prisma Client 已就绪。

## docker 部署

构建 Docker 镜像：

```bash
docker build -t cloneprocesson .
```

运行 Docker 容器（确保 Postgres 数据库已启动并配置好）：

```bash
docker run -p 3000:3000 --env-file .env cloneprocesson
```

## TODO

- ✅ 支持 POS 文件导入
- [ ] websocket 多人同步编辑
- [ ] 文件上传
- [ ] 生成缩略图
- ✅ 分享页面

## 联系

备注来源

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a856f92420f485cba31fe5a8ee01511~tplv-k3u1fbpfcp-watermark.image?)

## 我的微信公众号

定位前端工程师进阶

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f1484497c4f647cc87aeb5f746f220de~tplv-k3u1fbpfcp-watermark.image?)
