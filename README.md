# Backoffice Operativo — Viajes Altairis

Backoffice web fullstack para gestao de hoteis, habitacoes, disponibilidade e reservas da Viajes Altairis.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | ASP.NET Core 8 + Entity Framework Core |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Banco de Dados | PostgreSQL 16 |
| Infra | Docker Compose |

## Como executar

**Requisito unico:** ter [Docker](https://docs.docker.com/get-docker/) instalado.

```bash
git clone <repo-url>
cd backoffice_operativo
docker compose up -d --build
```

Pronto. Aguarde ~30 segundos para o banco inicializar e o seed rodar.

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Swagger:** http://localhost:5000/swagger

> Se a porta 3000 ja estiver em uso, altere no `docker-compose.yml`: `"3001:3000"`

## Para parar

```bash
docker compose down
```

Para resetar o banco (apagar todos os dados e recriar do seed):

```bash
docker compose down -v
docker compose up -d --build
```

## Testes

```bash
cd frontend
npm install --legacy-peer-deps
npm test
```

## Funcionalidades

- **Dashboard** — KPIs, grafico de ocupacao, reservas por estado, top hoteis
- **Hoteis** — CRUD com busca, paginacao, filtros
- **Habitacoes** — Tipos de quarto por hotel, busca, cards
- **Disponibilidade** — Grid visual com cores por nivel de ocupacao
- **Reservas** — CRUD com busca, filtro por status, atualizacao de status
- Exclusao de hotel cancela reservas ativas automaticamente
- Validacoes com mensagens em espanhol
- Loading animation na abertura
- Responsivo (sidebar mobile)
