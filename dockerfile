# 使用轻量级 Node.js 镜像
FROM node:18-alpine

RUN apt-get update
RUN apt-get install -y openssl

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
# 设置工作目录
WORKDIR /home/node/app

COPY package.json yarn.lock ./

USER node

# 安装所有依赖
RUN yarn install

# 复制所有应用代码
COPY . .
# 生成 Prisma 客户端
RUN npx prisma generate
# 打包应用
RUN yarn build

# 暴露应用端口
EXPOSE 3000

# 启动应用，首先运行数据库迁移命令
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]