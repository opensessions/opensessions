FROM node:6.2.2

ENV NPM_CONFIG_LOGLEVEL warn
ARG buildNumber
ENV BUILD_NUMBER $buildNumber

RUN mkdir -p /usr/src/app
COPY . /usr/src/app
WORKDIR /usr/src/app

RUN cd $(npm root -g)/npm \
 && npm install fs-extra \
 && sed -i -e s/graceful-fs/fs-extra/ -e s/fs\.rename/fs.move/ ./lib/utils/rename.js
RUN npm install
RUN npm run build:app

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start:prod"]
