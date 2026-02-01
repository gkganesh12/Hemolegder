FROM node:18-alpine

WORKDIR /chaincode

COPY package*.json ./
RUN npm install --production

COPY . .

ENV CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999
ENV CHAINCODE_ID=bloodbank_1.0:placeholder

CMD ["node", "index.js"]
