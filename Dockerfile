FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --silent
RUN npm install -g typescript
COPY . /usr/src/app
RUN npm run build
CMD ["npm", "run", "start"]