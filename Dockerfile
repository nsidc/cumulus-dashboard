# image from Docker Hub: node:12-slim
ARG image=maven.earthdata.nasa.gov/node:12-slim
FROM ${image}

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
RUN npm ci

COPY . .

EXPOSE 3000

CMD npm run serve
