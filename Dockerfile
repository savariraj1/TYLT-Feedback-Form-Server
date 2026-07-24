FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=development
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "run", "dev"]

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["npm", "start"]
