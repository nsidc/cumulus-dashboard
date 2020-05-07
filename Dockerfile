FROM node:10-slim

RUN apt-get update && \
    apt-get install -y \
      git \
      make \
      python3

RUN mkdir /dashboard
WORKDIR /dashboard

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD npm run serve
