# Testes automatizados — Vyzin

Guia para executar, entender e estender os testes do projeto.

**Última atualização:** junho/2026

---

## Visão geral

| Camada | Framework | Comando | Testes |
|--------|-----------|---------|--------|
| Backend unitários | Jest | `cd backend && npm test` | 14 |
| Backend e2e | Jest + Supertest | `cd backend && npm run test:e2e` | 46 |
| Frontend | Vitest | `cd frontend && npm test` | 6 |

Todos os **endpoints da API** possuem cobertura e2e em `backend/test/api.e2e-spec.ts`.

---

## Backend — testes unitários

### Executar

```bash
cd backend
npm test              # uma vez
npm run test:watch    # modo watch
npm run test:cov      # com cobertura
```

### Arquivos

| Arquivo | O que testa |
|---------|-------------|
| `src/app.controller.spec.ts` | Healthcheck `GET /` |
| `src/auth/services/auth-session.service.spec.ts` | Login/logout (mock Firebase) |
| `src/users/services/users.service.spec.ts` | Criação de usuário |
| `src/reservas/services/reservations.service.spec.ts` | Validação de slots |
| `src/visitantes/services/visitors.service.spec.ts` | Workflow + data passada |
| `src/pre-authorizations/services/pre-authorizations.service.spec.ts` | CRUD pré-autorizados |
| `src/informacoes/services/information.service.spec.ts` | GET/PUT informações |

### Padrão

- Services testados com **mocks** de `RepositoryFactory` e dependências externas
- Sem Firestore real — repositórios substituídos por objetos in-memory

---

## Backend — testes e2e

### Executar

```bash
cd backend
npm run test:e2e
```

### Infraestrutura — `backend/test/support/`

| Arquivo | Função |
|---------|--------|
| `create-test-app.ts` | Monta app NestJS com mocks |
| `memory-store.ts` | Firestore simulado em memória |
| `mock-firebase.service.ts` | Substitui Firebase Admin |
| `mock-auth-session.service.ts` | Substitui login real |
| `test-auth.helper.ts` | Autentica com `Authorization: Bearer test:<profileId>` |

### Autenticação nos testes

O `FirebaseAuthGuard` aceita em `NODE_ENV=test`:

```
Authorization: Bearer test:admin
Authorization: Bearer test:doorman
Authorization: Bearer test:resident
```

O `FunctionGuard` carrega funções do seed em memória para esses perfis.

### Cobertura de endpoints (`api.e2e-spec.ts`)

| Grupo | Endpoints testados |
|-------|-------------------|
| Público | `GET /` |
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Functions | `GET /functions` |
| Profiles | CRUD completo + proteções de sistema |
| Users | CRUD completo |
| Reservations | CRUD, spaces, available-slots, link/unlink visitante |
| Visitors | CRUD, PATCH status, validação data passada |
| Pre-authorizations | CRUD com escopo por morador |
| Announcements | CRUD + filtros |
| Information | GET/PUT |
| Reports | GET operational com filtros |

### Adicionar novo endpoint

1. Implemente controller + service
2. Adicione bloco `describe` em `api.e2e-spec.ts`
3. Use `Bearer test:admin` (ou perfil adequado) para rotas autenticadas
4. Verifique status HTTP e corpo da resposta

---

## Frontend — Vitest

### Executar

```bash
cd frontend
npm test              # uma vez
npm run typecheck     # verificação TypeScript
```

### Arquivos

| Arquivo | O que testa |
|---------|-------------|
| `utils/permissions.test.ts` | `getUserPermissions` — flags por função |
| `utils/dates.test.ts` | `todayISO`, `isVisitSlotInPast` |

### Por que poucos testes no frontend?

O MVP concentra validações de negócio no **backend** (security scopes, slots, datas). O frontend testa utilitários puros; fluxos integrados são cobertos pelos e2e da API.

---

## CI / pipeline sugerido

```bash
# Na raiz ou em jobs separados
cd backend && npm test && npm run test:e2e
cd frontend && npm test && npm run typecheck && npm run build
```

---

## Referências

- [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md) — arquitetura
- [SETUP_TESTE.md](./SETUP_TESTE.md) — testes manuais com emuladores
- [MAPA_DO_CODIGO.md](./MAPA_DO_CODIGO.md) — localização dos arquivos de teste
