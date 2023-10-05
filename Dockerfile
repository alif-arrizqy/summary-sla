FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --production --silent
COPY . /usr/src/app
RUN npm run build
CMD ["node", "./dist/index.js"]