FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --silent
COPY . /usr/src/app
RUN npm run build
CMD ["npm", "run", "start"]