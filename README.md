# Adastra EDScript  — Backend Node.js + TypeScript

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow?style=for-the-badge)

<p align="center">
  <a href="#sobre">Sobre</a> •
  <a href="#stacks">Stacks</a> •
  <a href="#estrutura">Estrutura</a> •
  <a href="#como-comecar">Como Começar</a>
</p>

**Betinha API** é a camada de backend responsável por toda a lógica de negócio e comunicação de dados do aplicativo mobile **Betinha**, desenvolvido em **React Native + TypeScript**.

Este projeto faz parte da entrega do **Grupo Betinha** no **Desafio 01 do Hackathon EDScript Recife 2026**, onde as equipes competidoras precisam reconstruir as jornadas essenciais do site da [Esportes da Sorte](https://www.esportesdasorte.com/) — patrocinadora principal do evento — em uma experiência **mobile nativa ou híbrida**.

🔗 O aplicativo mobile desenvolvido em React Native está disponível [aqui](#).

<h2 id="sobre"> 📌 Sobre</h2>

A API foi construída com **Node.js** e **TypeScript**, seguindo uma arquitetura modular e de fácil manutenção. Ela expõe os endpoints consumidos pelo app mobile, centralizando regras de negócio, autenticação e integração com o banco de dados.

O servidor utiliza variáveis de ambiente via `.env` para configuração de porta e demais parâmetros sensíveis, e conta com suporte a **Docker** para padronizar os ambientes de desenvolvimento e produção.

<h2 id="stacks"> 🧪 Stacks</h2>

- [Node.js 20](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express 5](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL 16](https://www.postgresql.org/)
- [Zod](https://zod.dev/)
- [Docker](https://www.docker.com/)

<h2 id="estrutura"> 📁 Estrutura de Pastas</h2>

```
adastra-edscript-api/
├── prisma/
│   ├── schema.prisma       # Schema do banco de dados
│   ├── seed.ts             # Script de seed (dados iniciais)
│   └── migrations/         # Histórico de migrations
├── src/
│   ├── main/
│   │   ├── server.ts       # Ponto de entrada
│   │   ├── app.ts          # Configuração do Express + Swagger
│   │   ├── routes.ts       # Registro central de rotas
│   │   └── docs/           # Configuração do Swagger/OpenAPI
│   ├── modules/            # Módulos de domínio (Clean Architecture)
│   │   ├── auth/
│   │   ├── betslip/        # Bilhetes de apostas
│   │   ├── games/
│   │   ├── profile/
│   │   ├── sports/
│   │   └── ...
│   └── shared/             # Middlewares, erros, utilitários
├── dist/                   # Build compilado (gerado)
└── .env.example            # Modelo de variáveis de ambiente
```

<h2 id="como-comecar"> ▶️ Como Começar</h2>

### Pré-requisitos

- [Node.js 20+](https://nodejs.org/) — para rodar localmente
- [Docker](https://www.docker.com/) e Docker Compose — para rodar via container

### Clone o repositório
```bash
git clone https://github.com/issagomesdev/edscript.git
cd edscript/api-edscript
```

### Copie o arquivo de exemplo e configure as variáveis `cp .env.example .env`
```bash
PORT=3000
...
```
### Suba o container
```bash
docker compose up -d
# API disponível em http://localhost:3000
# Swagger UI em http://localhost:3000/docs
```

### Configure o banco de dados

> **Importante:** os comandos `docker:*` rodam dentro do container e usam o host `postgres` (correto para Docker).
> Os comandos `db:*` rodam localmente e exigem `DATABASE_URL` apontando para `localhost`.

**Primeira vez (reset + seed):**
```bash
npm run docker:setup
```

**Após criar ou alterar o schema (nova migration):**
```bash
npm run docker:migrate
# ou com nome descritivo:
docker compose exec api npx prisma migrate dev --name nome-da-migration
```

**Apenas repopular dados (seed):**
```bash
npm run docker:seed
```

**Reset completo + seed (cuidado: apaga todos os dados):**
```bash
npm run docker:setup
```

---

### Scripts disponíveis

#### Aplicação
| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia em desenvolvimento com hot reload |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm start` | Inicia a partir do build compilado |
| `npm run type-check` | Verifica tipagem sem compilar |

#### Banco de dados (via Docker — recomendado)
| Comando | Descrição |
|---|---|
| `npm run docker:migrate` | Cria/aplica migrations dentro do container |
| `npm run docker:seed` | Popula o banco com dados iniciais |
| `npm run docker:setup` | Reset + seed em um único comando |

#### Banco de dados (local — `DATABASE_URL` com `localhost`)
| Comando | Descrição |
|---|---|
| `npm run db:migrate` | Cria/aplica migrations localmente |
| `npm run db:seed` | Roda o seed localmente |
| `npm run db:setup` | Reset + seed localmente |
| `npm run db:generate` | Regenera o Prisma Client |

#### Testes
| Comando | Descrição |
|---|---|
| `npm test` | Roda todos os testes |
| `npm run test:watch` | Testes em modo watch |
| `npm run test:coverage` | Relatório de cobertura |

---

🔗 Repositório do App mobile (React Native) disponível [aqui](https://github.com/adastra-hackathon/adastra-edscript)
