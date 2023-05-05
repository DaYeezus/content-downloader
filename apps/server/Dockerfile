FROM node:18-alpine As development
WORKDIR /app
COPY package.json yarn.lock ./

RUN yarn install

COPY . .
EXPOSE 5000
CMD ["yarn" , "dev"]
FROM node:18-alpine as production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn  install --only=production
RUN yarn build 
COPY . .

EXPOSE 5000
CMD ["yarn" , "run" , "start"]
