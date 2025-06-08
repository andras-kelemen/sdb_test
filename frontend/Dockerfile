FROM node:18-bullseye-slim

WORKDIR /app

COPY frontend/package*.json ./

RUN npm install
RUN npm install -g serve

COPY frontend/ ./

RUN npm run build

CMD ["serve", "-s", "dist", "-l", "5000"]