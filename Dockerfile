FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --silent
COPY . /usr/src/app
RUN npm install -g typescript
RUN npm run build
CMD ["npm", "run", "start"]