# Vyzin — Regras de Negócio

**Versão:** alinhada ao código em `backend/src/` e `frontend/src/app/`  
**Última atualização:** junho/2026

Este documento descreve **o que o sistema faz e não faz**, independentemente da implementação técnica. Para detalhes de código, consulte [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md).

---

## 1. Princípios gerais

| ID | Regra |
|----|-------|
| RN-01 | Toda operação sensível exige usuário autenticado (cookie de sessão válido ou token Firebase). |
| RN-02 | Permissões são definidas por **perfil**, não hardcoded por papel fixo no código de negócio. |
| RN-03 | O backend é a **fonte de verdade** para autorização; o frontend apenas oculta UI. |
| RN-04 | Um usuário pertence a **exatamente um perfil** por vez (`profileId`). |
| RN-05 | Dados persistidos no Firestore; o Admin SDK no backend aplica **security scopes** por entidade. |
| RN-06 | Filtros de busca textual nas listagens são aplicados **no servidor**, não apenas no cliente. |

---

## 2. Autenticação e identidade

### RN-AUTH-01 — Login

- Login via **e-mail e senha** através da API: `POST /auth/login`.
- O backend autentica no Firebase (REST Identity Toolkit), cria **session cookie** e retorna `{ user, profile }`.
- O frontend **não** usa Firebase SDK — envia o cookie `vyzin_session` automaticamente (`withCredentials: true`).

### RN-AUTH-02 — Custom claim e perfil

- Ao criar ou alterar o perfil de um usuário, o backend atualiza a custom claim Firebase: `{ profileId: "<id>" }`.
- As **funções** são sempre carregadas do documento do perfil no Firestore pelo `FunctionGuard` (não confiar apenas no token).

### RN-AUTH-03 — Sessão

- Cookie `vyzin_session`: httpOnly, sameSite=lax, secure em produção.
- `POST /auth/logout` revoga refresh tokens e limpa o cookie.
- Sessão inválida ou expirada → API retorna **401**; frontend redireciona ao login.
- Após alteração de funções no perfil (seed ou CRUD de perfis), usuário deve **logout/login** para recarregar permissões no frontend.

### RN-AUTH-04 — Endpoint `/auth/me`

- Retorna dados do usuário (`users/{uid}`) e perfil associado (incluindo `functions[]`).
- Usado pelo frontend para montar menu e flags de permissão.

### RN-AUTH-05 — Autenticação alternativa (API / testes)

- Rotas também aceitam `Authorization: Bearer <Firebase ID token>` para integrações.
- Em ambiente de teste: `Bearer test:<profileId>` para simular perfis.

---

## 3. RBAC — Perfis e funções

### Modelo

```
Usuário ──profileId──► Perfil ──functions[]──► Funções ──► Endpoints
```

### RN-RBAC-01 — Catálogo de funções

Funções são identificadores estáveis (`area:acao`). Catálogo completo em `backend/src/auth/functions/app-functions.ts`:

| Função | Descrição |
|--------|-----------|
| `reservations:read` | Listar e visualizar reservas (escopo por security scope) |
| `reservations:manage` | Criar, editar e excluir **próprias** reservas |
| `reservations:manage_all` | Criar, editar e excluir reservas de **qualquer** usuário |
| `visitors:read` | Listar e visualizar visitantes |
| `visitors:manage` | Cadastrar, editar, remover e **vincular** visitantes |
| `visitors:workflow` | Autorizar, negar e registrar saída (portaria) |
| `announcements:read` | Visualizar avisos |
| `announcements:manage` | Publicar, editar e remover avisos |
| `information:read` | Visualizar tela Informações |
| `information:edit` | Editar conteúdo via `PUT /information` |
| `users:read` | Listar usuários |
| `users:manage` | Criar, editar e remover usuários |
| `profiles:read` | Listar perfis e catálogo de funções |
| `profiles:manage` | Criar, editar e remover perfis |
| `reports:read` | Visualizar relatório operacional e exportar CSV |

### RN-RBAC-02 — Perfis de sistema (seed)

| Perfil | ID | Funções (resumo) |
|--------|-----|------------------|
| Administrador | `admin` | Todas (`ALL_FUNCTIONS`, sincronizado a cada seed) |
| Porteiro | `doorman` | Reservas (leitura geral), visitantes (CRUD + workflow + vínculo), avisos (leitura), usuários, **relatórios** |
| Morador | `resident` | Reservas (leitura + próprias), visitantes (leitura + CRUD + vínculo), avisos, informações, **relatórios** (dados próprios) |

O seed **mescla** novas funções em perfis existentes ao ser reexecutado.

### RN-RBAC-03 — Guarda de funções

- Endpoints anotados com `@RequireFunction(...)` exigem que o usuário possua **todas** as funções listadas.
- Ausência de função → HTTP **403 Forbidden**.

### RN-RBAC-04 — Proteção contra lockout

Perfis marcados `isSystem: true` (ex.: `admin`):

- **Não podem ser excluídos.**
- **Não podem perder** as funções `profiles:manage` e `users:manage`.

### RN-RBAC-05 — Exclusão de perfil

- Perfil com usuários vinculados **não pode ser excluído** (409 Conflict).
- Perfis de sistema **não podem ser excluídos**.

### RN-RBAC-06 — Perfis customizados

- Administrador pode criar perfis com subconjunto arbitrário de funções via tela **Segurança → Perfis**.
- Novos perfis nascem com `isSystem: false`.

---

## 4. Usuários

### RN-USER-01 a RN-USER-05

(Inalteradas — ver versão anterior: criação provisiona Firebase Auth + Firestore + claim; campos obrigatórios; e-mail imutável no update; exclusão remove Auth + Firestore; gestão requer `users:manage`.)

---

## 5. Reservas

### RN-RES-01 — Entidade

| Campo | Tipo / valores | Regra |
|-------|----------------|-------|
| space | string | Nome da área (salão, churrasqueira, etc.) |
| date | data | Dia da reserva |
| startTime / endTime | string (HH:mm) | Intervalo do slot selecionado |
| status | `confirmed` \| `cancelled` | Estado da reserva |
| notes | string | Observações opcionais |
| createdBy | uid | Preenchido automaticamente na criação |
| linkedVisitorIds | string[] | IDs de visitantes vinculados |

Respostas enriquecidas com `createdByName`, `createdByEmail`, `createdByDisplay`.

### RN-RES-02 — Criação

- Requer `reservations:manage`.
- **Data da reserva não pode ser anterior a hoje** (`assertNotInPast`).
- Reservas confirmadas validam **disponibilidade do slot** (`assertSlotAvailable`).
- `createdBy` = uid do usuário autenticado.

### RN-RES-03 — Ownership (alteração e exclusão)

- Morador com `reservations:manage`: edita/exclui somente onde `createdBy === uid`.
- Admin com `reservations:manage_all`: edita/exclui qualquer reserva.
- Tentativa não autorizada → **403 Forbidden** (security scope).

### RN-RES-04 — Leitura (escopo)

- Requer `reservations:read`.
- **Morador:** vê apenas **próprias** reservas (filtro `createdBy` no scope).
- **Porteiro:** vê **todas** as reservas (`RESERVATIONS_READ` sem `RESERVATIONS_MANAGE`).
- **Admin:** vê todas (`RESERVATIONS_MANAGE_ALL`).

### RN-RES-05 — Filtros

- `?status=confirmed|cancelled`
- `?date=YYYY-MM-DD`
- `?search=` — busca em espaço, solicitante, observações (servidor)

### RN-RES-06 — Conflito de horário

- **Implementado.** Slots definidos por espaço em `reservation-schedule.ts`.
- API `GET /reservations/available-slots` retorna todos os blocos com flag `available`.
- Criação e alteração de horário/espaço revalidam conflito; alteração só de `linkedVisitorIds` **não** revalida slot.

### RN-RES-07 — Vínculo com visitantes

- Vínculo via `POST /reservations/:id/visitors/:visitorId` e desvínculo via `DELETE` (requer `visitors:manage`).
- Autorização de vínculo: dono da reserva, admin (`manage_all`) ou porteiro com `visitors:manage` + leitura geral de reservas.
- Referência unidirecional: reserva → `linkedVisitorIds[]`.
- Modal na UI: selecionar existente ou cadastrar novo + vincular.

### RN-RES-08 — Cancelamento

- Status `cancelled` preserva histórico; vínculos podem ser limpos na UI ao cancelar.

---

## 6. Visitantes

### RN-VIS-01 — Tipos e workflow

| Campo / estado | Valores | Regra |
|----------------|---------|-------|
| visitType | `apartment` \| `reservation` | Origem da visita |
| status | `waiting` → `authorized` \| `denied` → `exited` | Workflow na portaria |
| createdBy | uid | Preenchido na criação (quem cadastrou) |

- Criação requer `visitors:manage`.
- Transição de status requer `visitors:workflow` (`PATCH /visitors/:id/status`).

### RN-VIS-02 — Data e horário

- **Não é permitido** cadastrar visita com **data anterior a hoje**.
- No **mesmo dia**, horário já passado é rejeitado pelo backend e desabilitado na UI.
- Validação: `assertNotInPast` no service; `isVisitSlotInPast` no frontend.

### RN-VIS-03 — Escopo de leitura e edição

- Morador vê/edita visitantes onde `createdBy === uid`.
- Porteiro com `visitors:workflow` tem bypass de escopo para operações de portaria.
- Admin vê todos.

### RN-VIS-04 — Filtros

- `?status=`, `?visitType=`, `?date=`, `?search=` (servidor)

### RN-VIS-05 — Exclusão

- Remove documento; desvincula de reservas associadas via API de unlink.

### RN-VIS-06 — Pré-autorizados

- Cadastro separado em `/pre-authorizations` (aba na tela Visitantes).
- Morador gerencia apenas registros com `createdBy === uid`.
- Requer `visitors:read` (listar) e `visitors:manage` (CRUD).
- Tipos comuns: diarista, familiar recorrente, prestador fixo.

---

## 7. Mural de avisos

### RN-MUR-01 a RN-MUR-06

(Categorias, flags, CRUD com `announcements:manage`, leitura com `announcements:read`, filtros `category`, `search`, `isPinned`, `isImportant`; likes/comentários estáticos.)

---

## 8. Relatório operacional

### RN-REP-01 — Acesso

- Requer `reports:read`.
- Disponível no menu **Relatório** e no painel (**Relatório Operacional**).

### RN-REP-02 — Escopo de dados

- Respeita security scopes de reservas e visitantes.
- Morador: apenas registros próprios/autorizados por ele.
- Porteiro/admin: visão ampliada conforme perfil.

### RN-REP-03 — Joins

| Join | Descrição |
|------|-----------|
| Reserva → Morador | `createdBy` → usuário + perfil |
| Reserva → Visitantes | `linkedVisitorIds[]` |
| Visitante → Cadastrante | `createdBy` → usuário + perfil |
| Visitante → Reserva | Lookup reverso + solicitante da reserva |

### RN-REP-04 — Filtros

- Período (`from`, `to`), status de reserva/visitante, espaço, tipo de visita, busca textual.

### RN-REP-05 — Exportação

- CSV de reservas e CSV de visitantes gerados no cliente a partir dos dados da API.

---

## 9. Informações do condomínio

### RN-INF-01 — Persistência

- Documento único no Firestore: `condoInformation/default`.
- Campos: nome, endereço, contatos, regras, documentos.

### RN-INF-02 — Leitura

- Requer `information:read`.
- Morador e perfis autorizados visualizam na rota `/informacoes`.

### RN-INF-03 — Edição

- Requer `information:edit` (perfil Administrador no seed).
- `PUT /information` atualiza o documento completo.
- UI: botão **Editar** abre dialog (`InformacoesEditDialog`) para admin.

---

## 10. Regras transversais de UI

| ID | Regra |
|----|-------|
| RN-UI-01 | Sidebar oculta itens sem permissão. |
| RN-UI-02 | `RequirePermission` redireciona ao dashboard se rota não permitida. |
| RN-UI-03 | Flags derivadas de `getUserPermissions(functions)`. |
| RN-UI-04 | Navegação por URL (`react-router-dom`); estado de modal pode vir de `location.state`. |
| RN-UI-05 | Listagens principais carregam dados filtrados via API (debounce de busca ~300 ms). |

---

## 11. Dados de demonstração (seed)

| Cenário | ID demo | Regra exercitada |
|---------|---------|------------------|
| Visitante aguardando | `demo-visitor-waiting` | Workflow portaria |
| Festa com convidados | `demo-reservation-party` + 2 visitantes | `linkedVisitorIds` |
| Reserva cancelada | `demo-reservation-cancelled` | Status `cancelled` |
| Churrasqueira livre | `demo-reservation-churrasqueira` | Vincular novo convidado |

Detalhes: [SETUP_TESTE.md](./SETUP_TESTE.md).

---

## 12. Matriz resumida — perfis seed vs domínios

| Domínio | Admin | Porteiro | Morador |
|---------|:-----:|:--------:|:-------:|
| Reservas — ler (escopo) | Todas | Todas | Próprias |
| Reservas — gerenciar próprias | ✓ | — | ✓ |
| Reservas — gerenciar todas | ✓ | — | — |
| Visitantes — ler | ✓ | ✓ | Próprios* |
| Visitantes — CRUD + vínculo | ✓ | ✓ | ✓ |
| Visitantes — workflow | ✓ | ✓ | — |
| Pré-autorizados — CRUD | ✓ | ✓† | Próprios |
| Avisos — ler | ✓ | ✓ | ✓ |
| Avisos — gerenciar | ✓ | — | — |
| Informações — ler | ✓ | — | ✓ |
| Informações — editar | ✓ | — | — |
| Relatórios | ✓ | ✓ | ✓‡ |
| Usuários — ler/gerenciar | ✓ | ✓ | — |
| Perfis — ler/gerenciar | ✓ | — | — |

\* Escopo por `createdBy`  
† Porteiro gerencia pré-autorizados conforme escopo de visitantes  
‡ Dados filtrados pelo security scope

---

## 13. Referências

- [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md)
- [MAPA_DO_CODIGO.md](./MAPA_DO_CODIGO.md)
- [TESTES.md](./TESTES.md)
- [CASOS_DE_USO.md](./CASOS_DE_USO.md)
- [PRODUTO_E_PROJETO.md](./PRODUTO_E_PROJETO.md)
