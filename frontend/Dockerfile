FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY packages/ ./packages/
COPY frontend/package.json ./frontend/
COPY services/games/package.json ./services/games/
COPY services/wallets/package.json ./services/wallets/

RUN bun install

COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
