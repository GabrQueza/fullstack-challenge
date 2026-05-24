FROM oven/bun:1-alpine

WORKDIR /app

COPY package.json ./
COPY packages/ ./packages/
COPY frontend/package.json ./frontend/
COPY services/games/package.json ./services/games/
COPY services/wallets/package.json ./services/wallets/

RUN bun install

COPY services/wallets/ ./services/wallets/

WORKDIR /app/services/wallets

EXPOSE 4002

CMD ["bun", "run", "src/main.ts"]
