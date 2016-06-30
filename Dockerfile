FROM node:6.2.2

ENV NPM_CONFIG_LOGLEVEL warn
ARG buildNumber
ENV BUILD_NUMBER $buildNumber

RUN mkdir -p /usr/src/app
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm install
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]
