# Mapa do código — Vyzin

Referência **arquivo a arquivo** do repositório. Use junto com [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md) para navegar o projeto.

**Última atualização:** junho/2026

---

## Raiz do repositório

| Arquivo / pasta | Descrição |
|-----------------|-----------|
| `README.md` | Visão geral, execução rápida, links para docs |
| `LICENSE` | Licença do projeto |
| `docs/` | Documentação completa |
| `backend/` | API NestJS + seed + emuladores |
| `frontend/` | SPA React |

---

## Backend — `backend/`

### Configuração e scripts

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Scripts: `start:dev`, `start:dev:local`, `emulators`, `seed`, `seed:local`, `test`, `test:e2e` |
| `.env.example` | Variáveis: porta, CORS, emuladores, credenciais Firebase |
| `firebase.json` | Portas dos emuladores Auth (9099) e Firestore (8080) |
| `.firebaserc` | Projeto Firebase `vyzin-app` |
| `requests.http` | Exemplos REST Client para todos os endpoints |
| `nest-cli.json` | Config NestJS build |
| `tsconfig.json` | TypeScript strict |

### Entrada da aplicação

| Arquivo | Descrição |
|---------|-----------|
| `src/main.ts` | Bootstrap: cookie-parser, CORS credentials, ValidationPipe, Swagger, porta |
| `src/app.module.ts` | Importa todos os módulos de domínio |
| `src/app.controller.ts` | `GET /` healthcheck público |
| `src/app.service.ts` | Mensagem de boas-vindas da API |

### Swagger — `src/swagger/`

| Arquivo | Descrição |
|---------|-----------|
| `swagger.config.ts` | DocumentBuilder, tags, auth schemes, setup em `/api/docs` |
| `api-secured.decorator.ts` | `@ApiSecured()` — documenta cookie + Bearer |
| `swagger.constants.ts` | Constantes dos schemes de autenticação |

### Auth — `src/auth/`

| Arquivo | Descrição |
|---------|-----------|
| `auth.module.ts` | Registra guards globais, controllers, AuthSessionService |
| `controllers/auth.controller.ts` | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| `controllers/functions.controller.ts` | `GET /functions` — catálogo AppFunction |
| `services/auth-session.service.ts` | Login REST Firebase + createSessionCookie + revoke |
| `services/auth-session.service.spec.ts` | Testes unitários do serviço de sessão |
| `guards/firebase-auth.guard.ts` | Valida cookie ou Bearer token |
| `guards/function.guard.ts` | Carrega perfil do Firestore e valida `@RequireFunction` |
| `decorators/public.decorator.ts` | Marca rotas sem autenticação |
| `decorators/require-function.decorator.ts` | Exige funções RBAC no handler |
| `decorators/current-user.decorator.ts` | Injeta `request.user` no parâmetro |
| `functions/app-functions.ts` | **Fonte única** do catálogo de funções |
| `constants/session.constants.ts` | Nome do cookie `vyzin_session` |
| `dto/login.dto.ts` | Validação email/senha no login |
| `types/authenticated-user.ts` | Tipos `AuthenticatedUser`, `AuthenticatedRequest` |

### Firebase — `src/firebase/`

| Arquivo | Descrição |
|---------|-----------|
| `firebase.module.ts` | Provider global FirebaseService |
| `firebase.service.ts` | Admin SDK: Auth + Firestore; detecta emuladores |
| `firebase-emulator.ts` | Helpers de conexão aos emuladores |

### Persistência — `src/persistence/`

| Arquivo | Descrição |
|---------|-----------|
| `persistence.module.ts` | Exporta RepositoryFactory |
| `collections.ts` | Nomes das coleções Firestore |
| `firestore/repository.factory.ts` | Factory scoped/unscoped por entidade |
| `firestore/firestore.repository.ts` | CRUD genérico Firestore |
| `firestore/scoped.repository.ts` | Wrapper que aplica security scope |
| `interfaces/repository.interface.ts` | Contrato IRepository |
| `interfaces/security-scope.interface.ts` | Contrato ISecurityScope |
| `interfaces/access-context.interface.ts` | Contexto `{ user, functions }` |
| `interfaces/find-options.interface.ts` | Opções de filtro e paginação |
| `interfaces/collection-definition.interface.ts` | Metadados da coleção |
| `scopes/reservation.security-scope.ts` | Escopo reservas por `createdBy` |
| `scopes/visitor.security-scope.ts` | Escopo visitantes por `createdBy` + workflow bypass |
| `scopes/pre-authorization.security-scope.ts` | Escopo pré-autorizados por `createdBy` |
| `scopes/user.security-scope.ts` | Porteiro vê só moradores |
| `scopes/ownership.security-scope.ts` | Base reutilizável de ownership |
| `scopes/open.security-scope.ts` | Sem filtro de ownership |
| `scopes/profile.security-scope.ts` | Escopo perfis |
| `scopes/announcement.security-scope.ts` | Escopo avisos |
| `utils/text-search.util.ts` | Busca textual em memória pós-query |

### Perfis — `src/profiles/`

| Arquivo | Descrição |
|---------|-----------|
| `profiles.module.ts` | Módulo NestJS |
| `controllers/profiles.controller.ts` | CRUD `/profiles` |
| `services/profiles.service.ts` | Lógica + proteção perfis de sistema |
| `entities/profile.entity.ts` | Entidade Profile |
| `dto/profile.dto.ts` | DTOs create/update/response |

### Usuários — `src/users/`

| Arquivo | Descrição |
|---------|-----------|
| `users.module.ts` | Módulo NestJS |
| `controllers/users.controller.ts` | CRUD `/users` |
| `services/users.service.ts` | Provisiona Auth + Firestore + custom claim |
| `services/users.service.spec.ts` | Testes unitários |
| `entities/user.entity.ts` | Entidade User |
| `dto/create-user.dto.ts` | DTO criação |
| `dto/filter-users.dto.ts` | Filtros de listagem |
| `mappers/user.converter.ts` | Firestore ↔ entity |

### Reservas — `src/reservas/`

| Arquivo | Descrição |
|---------|-----------|
| `reservations.module.ts` | Módulo NestJS |
| `controllers/reservations.controller.ts` | CRUD + spaces + slots + link visitante |
| `services/reservations.service.ts` | Validações slot, data passada, ownership |
| `services/reservations.service.spec.ts` | Testes unitários |
| `config/reservation-schedule.ts` | Espaços, horários e duração de blocos |
| `entities/reservations.entity.ts` | Entidade Reservation |
| `dto/reservation.dto.ts` | DTO create/update |
| `dto/reservation-response.dto.ts` | Resposta enriquecida |
| `dto/filter-reservations.dto.ts` | Filtros query |
| `dto/filter-available-slots.dto.ts` | Parâmetros available-slots |
| `mappers/reservation.converter.ts` | Firestore ↔ entity |

### Visitantes — `src/visitantes/`

| Arquivo | Descrição |
|---------|-----------|
| `visitors.module.ts` | Módulo NestJS |
| `controllers/visitors.controller.ts` | CRUD + PATCH status |
| `services/visitors.service.ts` | Workflow, assertNotInPast, createdBy |
| `services/visitors.service.spec.ts` | Testes unitários |
| `entities/visitor.entity.ts` | Entidade Visitor |
| `dto/visitor.dto.ts` | DTO create/update |
| `dto/visitor-response.dto.ts` | Resposta enriquecida |
| `dto/filter-visitors.dto.ts` | Filtros query |
| `mappers/visitor.converter.ts` | Firestore ↔ entity |

### Pré-autorizados — `src/pre-authorizations/`

| Arquivo | Descrição |
|---------|-----------|
| `pre-authorizations.module.ts` | Módulo NestJS |
| `controllers/pre-authorizations.controller.ts` | CRUD `/pre-authorizations` |
| `services/pre-authorizations.service.ts` | CRUD com escopo createdBy |
| `services/pre-authorizations.service.spec.ts` | Testes unitários |
| `entities/pre-authorization.entity.ts` | Entidade PreAuthorization |
| `dto/pre-authorization.dto.ts` | DTOs |
| `mappers/pre-authorization.converter.ts` | Firestore ↔ entity |

### Mural — `src/mural/`

| Arquivo | Descrição |
|---------|-----------|
| `mural.module.ts` | Módulo NestJS |
| `controllers/announcements.controller.ts` | CRUD `/announcements` |
| `services/announcements.service.ts` | Lógica de avisos |
| `entities/announcement.entity.ts` | Entidade Announcement |
| `dto/announcement.dto.ts` | DTO create/update |
| `dto/announcement-response.dto.ts` | Resposta |
| `dto/filter-announcements.dto.ts` | Filtros query |
| `mappers/announcement.converter.ts` | Firestore ↔ entity |

### Informações — `src/informacoes/`

| Arquivo | Descrição |
|---------|-----------|
| `information.module.ts` | Módulo NestJS |
| `controllers/information.controller.ts` | `GET/PUT /information` |
| `services/information.service.ts` | Lê/grava `condoInformation/default` |
| `services/information.service.spec.ts` | Testes unitários |
| `entities/condo-information.entity.ts` | Estrutura do documento |
| `dto/condo-information.dto.ts` | DTO update |
| `mappers/condo-information.converter.ts` | Firestore ↔ entity |

### Relatórios — `src/reports/`

| Arquivo | Descrição |
|---------|-----------|
| `reports.module.ts` | Módulo NestJS |
| `controllers/reports.controller.ts` | `GET /reports/operational` |
| `services/reports.service.ts` | Joins + filtros + security scopes |
| `dto/filter-operational-report.dto.ts` | Filtros query |
| `dto/operational-report.dto.ts` | Estrutura da resposta |

### Seed — `src/scripts/`

| Arquivo | Descrição |
|---------|-----------|
| `seed.ts` | Bootstrap idempotente: perfis, usuários, reservas, visitantes, avisos, informações |

### Testes — `backend/test/`

| Arquivo | Descrição |
|---------|-----------|
| `api.e2e-spec.ts` | 46 testes cobrindo todos os endpoints |
| `jest-e2e.json` | Config Jest e2e |
| `support/create-test-app.ts` | Factory da app de teste |
| `support/memory-store.ts` | Firestore em memória |
| `support/mock-firebase.service.ts` | Mock Firebase |
| `support/mock-auth-session.service.ts` | Mock sessão |
| `support/test-auth.helper.ts` | Helper Bearer `test:<profileId>` |

---

## Frontend — `frontend/`

### Configuração

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Scripts: `dev`, `build`, `test`, `typecheck` |
| `.env.example` | `VITE_API_URL=http://localhost:3000` |
| `vite.config.ts` | Dev server porta 3001, alias `@` |
| `index.html` | Entry HTML |
| `src/main.tsx` | Mount React |
| `src/styles/globals.css` | Tailwind v4 + tokens de design |

### App core

| Arquivo | Descrição |
|---------|-----------|
| `src/app/App.tsx` | Providers + Router |
| `src/app/router/index.tsx` | Definição de rotas |
| `src/app/router/paths.ts` | Constantes de paths |
| `src/app/router/RequirePermission.tsx` | Guard de rota por permissão |

### Layouts

| Arquivo | Descrição |
|---------|-----------|
| `layouts/RootLayout.tsx` | Layout login (sem sidebar) |
| `layouts/AppLayout.tsx` | Sidebar + outlet principal |
| `layouts/SegurancaLayout.tsx` | Submenu Segurança |

### Pages (wrappers finos)

| Arquivo | Rota |
|---------|------|
| `pages/login/page.tsx` | `/login` |
| `pages/dashboard/page.tsx` | `/dashboard` |
| `pages/reservations/page.tsx` | `/reservations` |
| `pages/visitantes/page.tsx` | `/visitantes` |
| `pages/mural/page.tsx` | `/mural` |
| `pages/relatorio/page.tsx` | `/relatorio` |
| `pages/informacoes/page.tsx` | `/informacoes` |
| `pages/seguranca/usuarios/page.tsx` | `/seguranca/usuarios` |
| `pages/seguranca/perfis/page.tsx` | `/seguranca/perfis` |

### Modules (UI de feature)

| Arquivo | Descrição |
|---------|-----------|
| `modules/dashboard/components/VyzinDashboard.tsx` | Painel com stats da API |
| `modules/reservations/components/Reservas.tsx` | CRUD reservas, slots, vínculo visitantes |
| `modules/visitantes/components/Visitantes.tsx` | Visitantes + pré-autorizados + workflow |
| `modules/mural/components/MuralAvisos.tsx` | Mural de avisos |
| `modules/relatorio/components/RelatorioOperacional.tsx` | Relatório + filtros + CSV |
| `modules/informacoes/components/Informacoes.tsx` | Visualização informações do condomínio |
| `modules/informacoes/components/InformacoesEditDialog.tsx` | Dialog de edição (admin) |
| `modules/seguranca/usuarios/components/UserManagement.tsx` | CRUD usuários |
| `modules/seguranca/perfis/components/ProfileManagement.tsx` | CRUD perfis RBAC |

### Componentes compartilhados

| Arquivo | Descrição |
|---------|-----------|
| `components/Sidebar.tsx` | Menu lateral filtrado por permissões |
| `components/Login.tsx` | Formulário de login |
| `components/ui/*` | shadcn/ui: button, card, dialog, input, select, tabs, etc. |

### Contextos

| Arquivo | Descrição |
|---------|-----------|
| `contexts/AuthContext.tsx` | Estado de autenticação global |
| `contexts/CondoDataContext.tsx` | Cache de usuários/reservas para vínculos |

### Infra HTTP

| Arquivo | Descrição |
|---------|-----------|
| `infra/http/apiClient.ts` | Axios instance com `withCredentials: true` |
| `infra/http/api.ts` | Re-export apiClient |
| `infra/http/queryParams.ts` | Serialização de filtros query |

### Repositories (camada de dados)

| Arquivo | Endpoints |
|---------|-----------|
| `data/authRepository.ts` | `/auth/login`, `/auth/logout`, `/auth/me` |
| `data/reservationRepository.ts` | `/reservations`, `/spaces`, `/available-slots` |
| `data/visitorRepository.ts` | `/visitors` |
| `data/preAuthorizationRepository.ts` | `/pre-authorizations` |
| `data/announcementRepository.ts` | `/announcements` |
| `data/informationRepository.ts` | `/information` |
| `data/userRepository.ts` | `/users` |
| `data/profileRepository.ts` | `/profiles` |
| `data/reportRepository.ts` | `/reports/operational` |

### Domain (tipos)

| Arquivo | Descrição |
|---------|-----------|
| `domain/user.ts` | Tipo User |
| `domain/profile.ts` | Tipo Profile |
| `domain/appFunction.ts` | Union type AppFunction |
| `domain/reservation.ts` | Tipo Reservation |
| `domain/reservationSpace.ts` | Espaço + blocos |
| `domain/visitor.ts` | Tipo Visitor |
| `domain/preAuthorization.ts` | Tipo PreAuthorization |
| `domain/announcement.ts` | Tipo Announcement |
| `domain/information.ts` | Tipo CondoInformation |
| `domain/report.ts` | Tipos do relatório operacional |
| `domain/listFilters.ts` | Filtros compartilhados |

### Utilitários e serviços

| Arquivo | Descrição |
|---------|-----------|
| `utils/permissions.ts` | `getUserPermissions` — flags de UI |
| `utils/permissions.test.ts` | Testes Vitest |
| `utils/dates.ts` | `todayISO`, `isVisitSlotInPast` |
| `utils/dates.test.ts` | Testes Vitest |
| `utils/displayLabels.ts` | Labels traduzidos para enums |
| `services/auth/authErrors.ts` | Mensagens de erro de login |
| `services/condo/condoQueries.ts` | Helpers de query para contexto |

---

## Documentação — `docs/`

| Arquivo | Conteúdo |
|---------|----------|
| `README.md` | Índice central |
| `DOCUMENTACAO_TECNICA.md` | Arquitetura e API |
| `MAPA_DO_CODIGO.md` | Este arquivo |
| `REGRAS_DE_NEGOCIO.md` | Regras RN-* |
| `CASOS_DE_USO.md` | Fluxos e diagramas |
| `SETUP_TESTE.md` | Ambiente e roteiro manual |
| `TESTES.md` | Testes automatizados |
| `PRODUTO_E_PROJETO.md` | Visão de produto |
| `APRESENTACAO_N2.md` | Roteiro de apresentação |

---

## Convenções de nomenclatura

| Contexto | Padrão | Exemplo |
|----------|--------|---------|
| Rotas API | kebab-case plural | `/pre-authorizations` |
| Coleções Firestore | camelCase plural | `preAuthorizations` |
| Módulos NestJS | PascalCase + Module | `VisitorsModule` |
| Entities | PascalCase singular | `Visitor` |
| DTOs | sufixo `.dto.ts` | `visitor.dto.ts` |
| Converters | sufixo `.converter.ts` | `visitor.converter.ts` |
| Frontend routes | paths em `paths.ts` | `PATHS.VISITANTES` |
| Funções RBAC | `area:acao` | `visitors:workflow` |
