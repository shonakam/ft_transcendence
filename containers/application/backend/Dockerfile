# -----------------
# 1. BUILD STAGE
# -----------------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# -----------------
# 2. PRD STAGE
# -----------------
FROM node:22-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD [ "node", "dist/main.js" ]
