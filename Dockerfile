FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

EXPOSE 3333

CMD ["npm", "run", "dev"]
