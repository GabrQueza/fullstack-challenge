# 🚀 Fullstack Crash Game Challenge

Este repositório contém a implementação completa de um sistema de Crash Game (Cassino), desenvolvido como parte do Fullstack Challenge. A arquitetura é baseada em microsserviços, utilizando Domain-Driven Design (DDD), comunicação assíncrona, e um algoritmo *Provably Fair*.

---

## 🛠️ Tecnologias Principais

- **Backend:** Node.js, NestJS, Bun, TypeScript
- **Frontend:** React 19, Next.js 16 (App Router), Zustand, Tailwind CSS, Shadcn/UI
- **Infraestrutura:** Docker, Docker Compose, PostgreSQL, RabbitMQ, Kong (API Gateway)
- **Autenticação:** Keycloak (OIDC) com NextAuth.js
- **Testes:** Bun Test Runner (Unitários e E2E)

---

## 🚀 Como Executar o Projeto

O projeto foi construído para subir de maneira **100% automatizada** e indolor, sem a necessidade de configurações manuais complexas.

### Pré-requisitos
- Docker e Docker Compose instalados.
- [Bun](https://bun.sh/) instalado (opcional, para testes locais rápidos).

### Passo a Passo

1. **Clone o repositório e acesse a pasta raiz:**
   ```bash
   git clone https://github.com/seu-usuario/fullstack-challenge.git
   cd fullstack-challenge
   ```

2. **Inicie a infraestrutura e a aplicação:**
   ```bash
   bun run docker:up
   # Ou, alternativamente: docker compose up --build -d
   ```

3. **Aguarde a inicialização dos containers.**
   O script cuidará de subir o banco de dados, aplicar migrações, provisionar o Keycloak e iniciar os microsserviços.

4. **Acesse as aplicações:**
   - **Frontend (Crash Game):** [http://localhost:3000](http://localhost:3000)
   - **Keycloak (Admin UI):** [http://localhost:8080](http://localhost:8080)
   - **Kong Gateway:** [http://localhost:8000](http://localhost:8000)
   - **RabbitMQ (Admin UI):** [http://localhost:15672](http://localhost:15672)

### 🧑‍💻 Credenciais de Teste

O Keycloak já é provisionado com um Realm importado (`realm-export.json`) que contém um dump oficial com carteira:

- **Login no Game (via Keycloak):** 
  - **Usuário:** `player`
  - **Senha:** `player123`
- *Nota: Ao fazer login, a Wallet será provisionada automaticamente com R$ 10.000,00 graças a lógica de auto-provisioning do backend, garantindo que usuários novos sempre possam jogar fora da caixa.*

---

## 🏗️ Estrutura do Projeto

A estrutura de pastas foi rigorosamente desenhada para escalar, separando responsabilidades:

```text
fullstack-challenge/
├── services/
│   ├── games/                             # Microsserviço responsável pelas regras do Crash
│   │   ├── src/
│   │   │   ├── domain/                    # Entidades (Round, Bet), Value Objects, Regras de Negócio
│   │   │   ├── application/               # Casos de Uso (GameEngine, GameService)
│   │   │   ├── infrastructure/            # MikroORM, RabbitMQ Publishers
│   │   │   └── presentation/              # Controllers NestJS e WebSocket Gateways
│   │   └── tests/
│   │       ├── unit/                      # Testes Unitários Isolados do Domínio
│   │       └── e2e/                       # Testes de Integração End-to-End da API
│   └── wallets/                           # Microsserviço responsável por saldos
│       ├── src/
│       │   ├── domain/                    # Entidades (Wallet), Exceções de Saldo
│       │   ├── application/               # Serviços de Manipulação (Débito/Crédito)
│       │   ├── infrastructure/            # MikroORM e RabbitMQ Subscribers
│       │   └── presentation/              # Controllers
│       └── tests/
│           └── unit/
├── frontend/                              # SPA Web (Next.js 16)
│   ├── src/
│   │   ├── app/                           # Next.js App Router Layouts e Pages
│   │   ├── components/                    # UI Components (Game Chart, Controls, Modal)
│   │   ├── hooks/                         # Hooks customizados (useSocket, useAudioEffects)
│   │   ├── lib/                           # Utilitários (Axios Auth Interceptors)
│   │   └── store/                         # Zustand Stores (Estado Global do Jogo)
├── docker/                                # Configurações da Infraestrutura
│   ├── kong/kong.yml                      # Configuração Declarativa do API Gateway
│   ├── keycloak/realm-export.json         # Dump de usuários e clients do Keycloak
│   └── postgres/init-databases.sh         # Script de criação dos bancos
├── docker-compose.yml                     # Orquestração Master
└── package.json                           # Scripts base e Workspaces
```
*(Obs: A estrutura do frontend utiliza a moderna convenção App Router (`app/`) e Stores (`store/`) ao invés do antigo padrão Pages).*

---

## 🧪 Suíte de Testes

A aplicação está coberta com testes nos fluxos críticos, totalizando **63 testes** automatizados que atestam a qualidade da arquitetura.

Para rodar os testes:
```bash
# 1. Testes Unitários de Domínio (Games - 37 specs)
cd services/games && bun test tests/unit

# 2. Testes Unitários de Domínio (Wallets - 15 specs)
cd services/wallets && bun test tests/unit

# 3. Testes de Integração API E2E (Games - 10 specs)
# Obs: Requer que os containers estejam rodando
cd services/games && bun test tests/e2e

# 4. Testes Baseline Frontend
cd frontend && bun test
```

---

## 🏛️ Decisões de Arquitetura & Trade-offs

### 1. Domain-Driven Design (DDD) & Hexagonal
Decidi usar táticas fortes de DDD. As regras de transição de estado da Rodada (BETTING -> IN_PROGRESS -> CRASHED) e o fluxo financeiro da Aposta e da Carteira existem **isoladas de banco de dados e frameworks**. O `WalletService` ou `GameEngineService` não espalham ifs arbitrários; eles invocam métodos na entidade de Domínio que protege suas invariantes (ex: é impossível uma Wallet ter saldo negativo ou sofrer cashout de um Round já finalizado).

### 2. Microsserviços e Comunicação Assíncrona
Separei o contexto de **Jogo** e **Carteira**.
A comunicação de sucesso (Aposta Colocada e Cashout Bem-Sucedido) foi implementada com **RabbitMQ**. 
- *Por que?* Se o serviço de carteira cair, a aposta não deve se perder. A emissão de eventos (`game.betPlaced`, `game.betWon`) permite garantir Eventual Consistency.

### 3. Matemática Financeira Limpa (Sem Flutuantes)
**Desclassificação Imediata evitada:** Todos os valores monetários no backend utilizam a API nativa do ECMAScript `BigInt` e são convertidos de centavos. A persistência no PostgreSQL é feita puramente em colunas `BIGINT`. Apenas o Frontend converte centavos em R$ na camada de visualização. O cálculo do multiplicador sobre a aposta usa divisões precisas convertidas após o cálculo.

### 4. API Gateway (Kong), Rate Limiting e Trade-offs de Rede
Todo o tráfego HTTP dos microsserviços está blindado por trás do **Kong Gateway**. Nenhum cliente se conecta diretamente ao backend NestJS. Implementei o plugin nativo de Rate Limiting (60 requests/min por IP) diretamente no `.yml` do Kong.
- *O Desafio:* Houve problemas reais de roteamento (`HTTP 503 Service Unavailable`) na configuração original das rotas no Kong, e problemas com os cabeçalhos de autenticação sendo "limpos" pelo gateway resultando em `HTTP 401 Unauthorized` nos microsserviços. 
- *A Solução (Trade-off):* Precisei desativar o `strip_path` no Kong e ajustar a passagem de `Authorization` nas requisições preflight/CORS. O trade-off é que os serviços backend agora precisam conhecer seus próprios prefixos (`/games`, `/wallets`), mas isso poupa um grande esforço de reescrita de rotas complexas.

### 5. Algoritmo Provably Fair & Segurança
O sistema roda em WebSockets em tempo real (via Socket.io). O Hash do `Server Seed` do próximo jogo é gerado *antes* do jogo iniciar (utilizando Node Crypto `SHA-256`), garantindo à comunidade de jogadores que os resultados do Game Engine não são forjados "on the fly" contra grandes apostas. Criei um Modal de Auditoria embutido que renderiza a fórmula matemática para transparência!

### 6. A Solução do "Double Dispatch" no Frontend (Zustand + WebSockets)
Em aplicações de tempo real usando WebSockets + Zustand (especialmente com React 19 e o novo `StrictMode`), é extremamente comum que ouvintes de socket disparem o mesmo evento de atualização de estado global duas vezes ("Double Dispatch").
- *A Solução:* Estruturei o hook `useSocket` com um padrão forte de Cleanup (`socket.off()`) dependente do ciclo de vida, garantindo que as store mutações (`useGameStore.setState()`) fossem completamente idempotentes. Além disso, no momento do Crash, uma chamada silenciosa via React Query (`queryClient.invalidateQueries`) puxa a Wallet com eventual consistency da API de forma segura.

### 7. Hooks de Áudio nativos vs MP3
No frontend, abri mão de carregar arquivos `.mp3` no build para evitar inflar pacotes, e construí os Efeitos Sonoros usando osciladores em tempo real pela **Web Audio API**. Um trade-off de código matemático mais longo (`useAudioEffects.ts`), mas com *Zero Bundle Cost* e responsividade imediata no clique e no Crash.
