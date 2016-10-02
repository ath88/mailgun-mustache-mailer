FROM node:slim
MAINTAINER Asbjørn Thegler <asbjoern@gmail.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app
RUN npm install

ENV NODE_ENV production

VOLUME /usr/src/app/jobs

CMD [ "npm", "start" ]
