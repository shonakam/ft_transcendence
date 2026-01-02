FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache bash curl ca-certificates
RUN npm install

COPY . .

# JSON-RPC
EXPOSE 8545

CMD ["npx", "hardhat", "node"]
