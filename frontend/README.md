# Frontend Vyzin — SPA React

Interface web do sistema Vyzin. Consome a API NestJS com **cookie de sessão** (`withCredentials: true`) — não usa Firebase SDK no cliente.

Documentação: [../docs/DOCUMENTACAO_TECNICA.md](../docs/DOCUMENTACAO_TECNICA.md) · [../docs/MAPA_DO_CODIGO.md](../docs/MAPA_DO_CODIGO.md)

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server em http://localhost:3001 |
| `npm run build` | Build de produção |
| `npm test` | Vitest (permissions, dates) |
| `npm run typecheck` | Verificação TypeScript |

---

## Setup

```bash
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

**Pré-requisito:** backend rodando (ver [../backend/README.md](../backend/README.md)).

---

## Estrutura `src/app/`

| Pasta | Responsabilidade |
|-------|------------------|
| `pages/` | Wrappers finos por rota |
| `modules/` | Componentes de feature (Reservas, Visitantes, etc.) |
| `layouts/` | AppLayout, Sidebar, login |
| `router/` | Rotas + `RequirePermission` |
| `data/` | Repositories HTTP |
| `domain/` | Tipos TypeScript |
| `contexts/` | AuthContext, CondoDataContext |
| `infra/http/` | apiClient (Axios + cookies) |
| `utils/` | permissions, dates, labels |

---

## Rotas principais

| Path | Módulo | Permissão |
|------|--------|-----------|
| `/dashboard` | Painel | sempre |
| `/reservations` | Reservas | `reservations:read` |
| `/visitantes` | Visitantes + pré-autorizados | `visitors:read` |
| `/mural` | Mural | `announcements:read` |
| `/relatorio` | Relatório | `reports:read` |
| `/informacoes` | Informações (+ edição admin) | `information:read` |
| `/seguranca/usuarios` | Usuários | `users:manage` |
| `/seguranca/perfis` | Perfis RBAC | `profiles:read` |

---

## Autenticação

1. `Login.tsx` → `authRepository.login()` → `POST /auth/login`
2. Cookie `vyzin_session` definido pelo backend
3. `AuthContext` carrega `/auth/me` na inicialização
4. `logout()` → `POST /auth/logout`

---

## Testes

```bash
npm test
```

Arquivos: `utils/permissions.test.ts`, `utils/dates.test.ts`

Guia: [../docs/TESTES.md](../docs/TESTES.md)
