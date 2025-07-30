FROM node:20.19-slim

RUN apt-get update && \
    apt-get install -y \
      awscli \
      g++ \
      git \
      make \
      python3

RUN mkdir /dashboard
WORKDIR /dashboard

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --no-optional

COPY . .

EXPOSE 3000

CMD npm run serve
