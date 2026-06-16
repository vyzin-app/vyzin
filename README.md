# Vyzin

Sistema de **gestão condominial** (MVP acadêmico/produto) para reservas, visitantes, mural, relatórios e administração de usuários com **RBAC dinâmico**.

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind v4, shadcn/ui, Axios |
| Backend | NestJS 11, TypeScript, class-validator |
| Autenticação | Firebase Auth (login **via backend** + cookie httpOnly) |
| Banco | Cloud Firestore (Admin SDK no servidor) |
| Autorização | Perfis + funções (`AppFunction`) + security scopes por entidade |

## O que o sistema faz

- **Reservas** de áreas comuns com validação de slots, conflitos e vínculo de convidados
- **Visitantes** com workflow na portaria (aguardando → autorizado/negado → saiu)
- **Pré-autorizados** (diaristas, familiares recorrentes) por morador
- **Mural** de avisos com categorias e destaque
- **Informações** do condomínio (contatos, regras, documentos, endereço) persistidas no Firestore
- **Relatório operacional** com joins reservas ↔ visitantes ↔ usuários ↔ perfis
- **Segurança** — CRUD de usuários e perfis RBAC

## Documentação

| Documento | Para quem | Conteúdo |
|-----------|-----------|----------|
| [docs/README.md](docs/README.md) | Todos | Índice central e guia de leitura |
| [docs/PRODUTO_E_PROJETO.md](docs/PRODUTO_E_PROJETO.md) | PO, stakeholders | Visão, personas, escopo, roadmap |
| [docs/REGRAS_DE_NEGOCIO.md](docs/REGRAS_DE_NEGOCIO.md) | QA, analistas | Regras RN-*, RBAC, validações |
| [docs/DOCUMENTACAO_TECNICA.md](docs/DOCUMENTACAO_TECNICA.md) | Devs | Arquitetura, API, persistência, auth |
| [docs/MAPA_DO_CODIGO.md](docs/MAPA_DO_CODIGO.md) | Devs | Mapa arquivo a arquivo do repositório |
| [docs/CASOS_DE_USO.md](docs/CASOS_DE_USO.md) | Todos | Fluxos e diagramas Mermaid |
| [docs/SETUP_TESTE.md](docs/SETUP_TESTE.md) | Devs / QA | Emuladores Firebase, seed, roteiro manual |
| [docs/TESTES.md](docs/TESTES.md) | Devs | Unitários, e2e, Vitest |
| [docs/APRESENTACAO_N2.md](docs/APRESENTACAO_N2.md) | Equipe N2 | Roteiro de apresentação |

## Execução rápida (desenvolvimento local)

Recomendado: **Firebase Emulators** — evita cota do Firestore de produção e não exige `firebase-key.json`.

### Terminal 1 — Emuladores

```bash
cd backend
npm install
npm run emulators
```

UI dos emuladores: http://localhost:4000

### Terminal 2 — Backend

```bash
cd backend
cp .env.example .env   # já aponta para emuladores
npm run start:dev:local
```

API: http://localhost:3000  
**Swagger UI:** http://localhost:3000/api/docs · **OpenAPI JSON:** http://localhost:3000/api/docs-json

### Terminal 3 — Seed (primeira vez)

```bash
cd backend
npm run seed:local
```

### Terminal 4 — Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:3001

### Usuários de teste (após seed)

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@vyzin.com | admin123 | Administrador |
| porteiro@vyzin.com | porteiro123 | Porteiro |
| morador@vyzin.com | morador123 | Morador (Apto 114, Bloco M) |

## Testes automatizados

```bash
cd backend && npm test && npm run test:e2e
cd frontend && npm test && npm run typecheck
```

Detalhes: [docs/TESTES.md](docs/TESTES.md).

## Documentação interativa da API (Swagger)

Com o backend rodando, acesse http://localhost:3000/api/docs.

1. Tag **Auth** → `POST /auth/login` → **Try it out** → use `admin@vyzin.com` / `admin123`
2. Clique **Execute** — o cookie de sessão é salvo automaticamente
3. Teste os demais endpoints sem precisar configurar o **Authorize**

Guia completo: [docs/DOCUMENTACAO_TECNICA.md](docs/DOCUMENTACAO_TECNICA.md#59-swagger-openapi).

## Produção / Firebase real

Comente as variáveis de emulador em `backend/.env`, configure `FIREBASE_WEB_API_KEY` e credenciais Admin (`firebase-key.json` ou `GOOGLE_APPLICATION_CREDENTIALS`), depois `npm run seed` e `npm run start:dev`.

## Licença

Ver [LICENSE](LICENSE).
