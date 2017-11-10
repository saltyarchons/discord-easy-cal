# codename nifty crab
FROM mhart/alpine-node:8

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "app.js"]
