# Backend Vyzin — API NestJS

API REST do sistema Vyzin. Persistência em **Cloud Firestore**, autenticação via **Firebase Auth** (sessão por cookie httpOnly).

Documentação completa: [../docs/DOCUMENTACAO_TECNICA.md](../docs/DOCUMENTACAO_TECNICA.md)

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run emulators` | Sobe emuladores Auth + Firestore (UI :4000) |
| `npm run start:dev:local` | Backend apontando para emuladores |
| `npm run start:dev` | Backend com Firebase real (`.env` sem vars de emulador) |
| `npm run seed:local` | Popula emuladores (com emulators rodando) |
| `npm run seed` | Popula Firestore real |
| `npm test` | Testes unitários (14) |
| `npm run test:e2e` | Testes e2e de todos endpoints (46) |
| `npm run build` | Compila para `dist/` |

---

## Desenvolvimento local (emuladores)

```bash
# Terminal 1
npm run emulators

# Terminal 2
cp .env.example .env
npm run start:dev:local

# Terminal 3 (primeira vez)
npm run seed:local
```

API: http://localhost:3000

**Swagger UI:** http://localhost:3000/api/docs  
**OpenAPI JSON:** http://localhost:3000/api/docs-json

---

## Variáveis de ambiente

Ver `.env.example`. Principais:

| Variável | Descrição |
|----------|-----------|
| `PORT` | Porta HTTP (padrão 3000) |
| `FRONTEND_ORIGIN` | Origin CORS (padrão http://localhost:3001) |
| `FIRESTORE_EMULATOR_HOST` | Emulador Firestore (dev local) |
| `FIREBASE_AUTH_EMULATOR_HOST` | Emulador Auth (dev local) |
| `FIREBASE_WEB_API_KEY` | Web API Key (ou `fake-api-key` no emulador) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Service account (produção) |

---

## Autenticação

| Rota | Descrição |
|------|-----------|
| `POST /auth/login` | Email/senha → cookie `vyzin_session` |
| `POST /auth/logout` | Revoga sessão |
| `GET /auth/me` | Usuário + perfil + funções |

Rotas protegidas exigem cookie ou `Authorization: Bearer <token>`.

RBAC: `@RequireFunction(...)` + `FunctionGuard` (funções lidas do Firestore).

---

## Módulos

| Módulo | Prefixo | Descrição |
|--------|---------|-----------|
| Auth | `/auth`, `/functions` | Sessão e catálogo RBAC |
| Profiles | `/profiles` | Perfis e funções |
| Users | `/users` | Usuários |
| Reservations | `/reservations` | Reservas, slots, espaços |
| Visitors | `/visitors` | Visitantes + workflow |
| PreAuthorizations | `/pre-authorizations` | Pré-autorizados |
| Mural | `/announcements` | Avisos |
| Information | `/information` | Dados do condomínio |
| Reports | `/reports` | Relatório operacional |

---

## Testar endpoints

Arquivo `requests.http` — exemplos para REST Client (VS Code/Cursor).

1. `POST /auth/login` com `admin@vyzin.com` / `admin123`
2. Demais requests usam o cookie de sessão

---

## Estrutura `src/`

```
src/
├── auth/              # Guards, sessão, AppFunction
├── firebase/          # Admin SDK
├── persistence/       # Repository + security scopes
├── profiles/
├── users/
├── reservas/
├── visitantes/
├── pre-authorizations/
├── mural/
├── informacoes/
├── reports/
├── scripts/seed.ts
├── app.module.ts
└── main.ts
```

Mapa detalhado: [../docs/MAPA_DO_CODIGO.md](../docs/MAPA_DO_CODIGO.md)

---

## Testes

```bash
npm test           # unitários
npm run test:e2e   # integração (memory store + Bearer test:<profileId>)
```

Guia: [../docs/TESTES.md](../docs/TESTES.md)
