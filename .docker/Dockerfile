FROM node:lts

WORKDIR /usr/src/app

# COPY . .
COPY LICENSE.md \
    package.json \
    package-lock.json \
    index.js \  
    ./
COPY lib lib

RUN npm ci --omit=dev
RUN npm link
