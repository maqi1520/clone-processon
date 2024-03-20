FROM node:16-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json yarn.lock ./

USER node

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 3000

CMD [ "npm", "run", "start" ]