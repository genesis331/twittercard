FROM node:latest
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD 1
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN apt-get update
RUN apt-get install fonts-noto-color-emoji --yes
RUN apt-get install chromium --yes

COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]