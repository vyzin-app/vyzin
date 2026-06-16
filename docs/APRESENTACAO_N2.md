# Apresentação N2 — Vyzin (React)

**Disciplina:** Avaliação N2 — Projeto React  
**Valor total:** 2,5 pontos  
**Equipe:** 6 integrantes  
**Tempo sugerido:** ~15 minutos (~2–3 min por pessoa)

Documentos relacionados: [PRODUTO_E_PROJETO.md](./PRODUTO_E_PROJETO.md) · [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md) · [SETUP_TESTE.md](./SETUP_TESTE.md)

---

## Critério do professor × Vyzin

| Parte | Pontos | O que mostrar no Vyzin |
|-------|--------|------------------------|
| Sistema de Login | 0,5 | `Login.tsx`, `AuthContext.tsx`, `RequirePermission.tsx` |
| CRUD 1 | 0,5 | **Visitantes** — `modules/visitantes/components/Visitantes.tsx` |
| CRUD 2 | 0,5 | **Reservas** — `modules/reservations/components/Reservas.tsx` + `ReservationCard` |
| CRUD 3 | 0,5 | **Usuários** — `modules/seguranca/usuarios/components/UserManagement.tsx` + `CondoDataContext` |
| Relatório com JOIN | 0,5 | `modules/relatorio/components/RelatorioOperacional.tsx` + `services/condo/condoQueries.ts` |
| **Total** | **2,5** | |

---

## Preparação antes da apresentação

### Subir o projeto

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

Abrir **http://localhost:3001**

### Seed e permissões

```bash
cd backend && npm run seed
```

Depois do seed, fazer **logout e login** no frontend (necessário para funções como `reports:read` aparecerem no menu).

### Usuários de demonstração

| E-mail | Senha | Perfil | Usar na demo de |
|--------|-------|--------|-----------------|
| morador@vyzin.com | morador123 | Morador | Visitantes, Reservas, Relatório (dados próprios) |
| admin@vyzin.com | admin123 | Administrador | Usuários, Mural, Relatório completo |
| porteiro@vyzin.com | porteiro123 | Porteiro | Backup (workflow visitante) |

### Checklist do dia

- [ ] Backend (:3000) e frontend (:3001) rodando
- [ ] Logout/login feito antes de começar
- [ ] Menu **Relatório** visível na sidebar
- [ ] Cada integrante ensaiou sua demo
- [ ] Cada integrante sabe responder: “Onde está o `useState`?” e “Onde está o `map()`?” na sua parte

---

## Ordem da apresentação

```
Pessoa 1 → Pessoa 2 → Pessoa 3 → Pessoa 4 → Pessoa 5 → Pessoa 6
(intro)    (login)     (CRUD 1)   (CRUD 2)   (CRUD 3)   (relatório)
```

---

## Pessoa 1 — Visão geral e arquitetura React - Thiago Renó

| | |
|---|---|
| **Dificuldade** | Baixa |
| **Tempo** | ~2 min |
| **Critério N2** | Organização do código (evita penalidade “tudo no App.jsx”) |

### O que apresentar

- O que é o Vyzin (gestão condominial).
- Conversão do layout HTML para React com organização por pastas.
- Stack: React + Vite + Context API + react-router-dom + API NestJS.

### Demo

Mostrar rapidamente: Login → Dashboard → Sidebar (módulos).

### Arquivos para citar

| Arquivo | Motivo |
|---------|--------|
| `frontend/src/app/App.tsx` | Só monta providers e router |
| `frontend/src/app/router/index.tsx` | Definição de rotas |
| `frontend/src/app/pages/` | Wrappers finos por rota |
| `frontend/src/app/modules/` | Telas de negócio por feature |

### Frase de abertura

> “O Vyzin é um sistema condominial em React. Não concentramos tudo no App: usamos pages, modules, contexts e router — cada tela em seu módulo.”

### Pergunta provável

**Por que não está tudo no App.jsx?**  
Separação por responsabilidade: rota, UI de negócio e estado global ficam em arquivos distintos.

---

## Pessoa 2 — Login, sessão e proteção de rotas - Pedro Viegas

| | |
|---|---|
| **Dificuldade** | Baixa |
| **Tempo** | ~2,5 min |
| **Critério N2** | Login — 0,5 pt |

### O que apresentar

- Formulário e-mail/senha com campos obrigatórios.
- **Context API** (`AuthContext`) para controle de sessão.
- **Logout** funcional.
- **Bloqueio** das telas de CRUD sem login (`RequirePermission`).

### Demo (ao vivo)

1. App deslogado → tentar acessar `/visitantes` → redireciona.
2. Login: `morador@vyzin.com` / `morador123`.
3. Entrar no painel.
4. Logout pela Sidebar → volta ao login.

### Arquivos para citar

| Arquivo | O que mostrar |
|---------|---------------|
| `frontend/src/app/components/Login.tsx` | `useState`, `isFormValid`, submit |
| `frontend/src/app/contexts/AuthContext.tsx` | `login`, `logout`, `functions` |
| `frontend/src/app/router/RequirePermission.tsx` | Guarda de rota |

### Pontuação coberta

| Critério professor | Pontos | Evidência |
|--------------------|--------|-----------|
| Formulário e validações | 0,2 | Campos obrigatórios + botão desabilitado |
| Sessão e logout | 0,2 | AuthContext + logout Sidebar |
| Proteção de rotas | 0,1 | RequirePermission |

### Frase-chave

> “A sessão fica no Context; as rotas de CRUD ficam protegidas — sem login não acessa o módulo.”

### Pergunta provável

**Onde está o controle de sessão?**  
`AuthContext` + Firebase Auth (token); após login chama `GET /auth/me` e guarda usuário e perfil no estado.

---

## Pessoa 3 — CRUD 1: Visitantes - Matheus Albino

| | |
|---|---|
| **Dificuldade** | Média |
| **Tempo** | ~2,5 min |
| **Critério N2** | CRUD 1 — 0,5 pt |

### O que apresentar

- **Create:** modal “Novo visitante” (validação nome + CPF).
- **Read:** listagem dinâmica com **`.map()`**.
- **Update:** editar cadastro.
- **Delete:** excluir com confirmação (AlertDialog).

### Demo (morador ou porteiro)

1. Menu **Visitantes** → **Novo visitante** → salvar.
2. Mostrar item na lista.
3. Editar um campo.
4. *(Opcional — porteiro)* Autorizar visitante em status `waiting` (Ana Paula no seed).

### Arquivo principal

`frontend/src/app/modules/visitantes/components/Visitantes.tsx`

### Pontuação coberta

| Critério professor | Pontos |
|--------------------|--------|
| Create com validação | 0,15 |
| Read com map() | 0,15 |
| Update e Delete | 0,20 |

### Frase-chave

> “Este é nosso primeiro CRUD completo: create com validação, read com map, update e delete funcionais.”

### Pergunta provável

**Onde está o map()?**  
Na renderização da lista de visitantes dentro de `Visitantes.tsx`.

---

## Pessoa 4 — CRUD 2: Reservas - Sarah Mesquita

| | |
|---|---|
| **Dificuldade** | Média-Alta |
| **Tempo** | ~2,5 min |
| **Critério N2** | CRUD 2 — 0,5 pt |

### O que apresentar

- **Create:** nova reserva (espaço, data, horário disponível).
- **Read:** listagem com componente reutilizável **`ReservationCard`**.
- **Update:** editar reserva existente.
- **Delete / Cancelar:** exclusão ou cancelamento.

### Demo (morador)

1. **Reservas** → Nova reserva → escolher slot livre → salvar.
2. Mostrar cards na listagem (mesmo componente repetido).
3. Editar observação ou cancelar uma reserva.
4. *(Opcional)* Expandir reserva → **Adicionar Visitante** → vincular convidado.

### Arquivo principal

`frontend/src/app/modules/reservations/components/Reservas.tsx`  
Destaque: componente **`ReservationCard`** (reutilizável).

### Pontuação coberta

| Critério professor | Pontos |
|--------------------|--------|
| Cadastro funcional | 0,15 |
| Listagem com componente reutilizável | 0,15 |
| Update e Delete corretos | 0,20 |

### Frase-chave

> “No CRUD de reservas, cada item da listagem usa o mesmo componente ReservationCard — isso atende o critério de componente reutilizável.”

### Pergunta provável

**Qual componente é reutilizável?**  
`ReservationCard`, usado para cada reserva na listagem.

---

## Pessoa 5 — CRUD 3: Usuários + estado global - Wemerson Silva

| | |
|---|---|
| **Dificuldade** | Média |
| **Tempo** | ~2,5 min |
| **Critério N2** | CRUD 3 — 0,5 pt |

### O que apresentar

- **CRUD 3:** gestão de **Usuários** (perfil admin).
- **useState** nos formulários e na listagem.
- **Persistência:** dados salvos via API (Firestore), não só em memória.
- **Estado global:** `CondoDataContext` compartilha reservas e visitantes entre telas.

### Demo (admin@vyzin.com / admin123)

1. **Segurança → Usuários**.
2. Listar usuários (`.map()`).
3. Criar ou editar um usuário.
4. Mencionar extra: **Mural** também é CRUD (avisos), se o professor perguntar.

### Arquivos para citar

| Arquivo | Motivo |
|---------|--------|
| `frontend/src/app/modules/seguranca/usuarios/components/UserManagement.tsx` | CRUD 3 |
| `frontend/src/app/contexts/CondoDataContext.tsx` | Estado global + persistência via API |
| `frontend/src/app/data/userRepository.ts` | Camada de acesso à API |

### Pontuação coberta

| Critério professor | Pontos |
|--------------------|--------|
| Uso correto de useState | 0,15 |
| Persistência (localStorage ou estado global) | 0,15 |
| CRUD completo e funcional | 0,20 |

### Frase-chave

> “O terceiro CRUD é de usuários, com useState no formulário e persistência no servidor. O CondoDataContext centraliza reservas e visitantes para outras telas.”

### Pergunta provável

**Onde está a persistência?**  
Repositories em `frontend/src/app/data/` chamam a API; o backend grava no Firestore.

---

## Pessoa 6 — Relatório com JOIN + encerramento - Victor Ruinivan

| | |
|---|---|
| **Dificuldade** | Alta |
| **Tempo** | ~3 min |
| **Critério N2** | Relatório — 0,5 pt |

### O que apresentar

Tela **Relatório Operacional** (`/relatorio`) com JOIN entre entidades:

| De | Chave | Para |
|----|-------|------|
| Reserva | `createdBy` | Morador (usuário solicitante) |
| Reserva | `linkedVisitorIds[]` | Visitantes vinculados |
| Visitante | `authorizedBy` | Usuário que autorizou |
| Visitante | lookup reverso em `linkedVisitorIds` | Reserva vinculada |

### JOIN no React (padrão exigido pelo professor)

`frontend/src/app/services/condo/condoQueries.ts`:

```typescript
// find + map + filter
return reservation.linkedVisitorIds
  .map((id) => visitors.find((visitor) => visitor.id === id))
  .filter((visitor): visitor is Visitor => Boolean(visitor))
```

Backend (extra): `backend/src/reports/services/reports.service.ts` enriquece dados no `GET /reports/operational`.

### Demo (ao vivo)

1. Painel → **Relatório Operacional** (ou menu **Relatório**).
2. Ajustar período (últimos 30 dias).
3. Aba **Reservas:** solicitante + convidados vinculados.
4. Aba **Visitantes:** autorizador + reserva.
5. *(Opcional)* Export **CSV Reservas** ou **CSV Visitantes**.

### Arquivos para citar

| Arquivo | Motivo |
|---------|--------|
| `frontend/src/app/modules/relatorio/components/RelatorioOperacional.tsx` | Tela do relatório |
| `frontend/src/app/services/condo/condoQueries.ts` | JOIN com find/map/filter |
| `frontend/src/app/data/reportRepository.ts` | Chamada à API |
| `backend/src/reports/services/reports.service.ts` | Joins no servidor |

### Pontuação coberta

| Critério professor | Pontos |
|--------------------|--------|
| JOIN corretamente implementado | 0,25 |
| Exibição clara do relatório | 0,15 |
| Organização do código | 0,10 |

### Frase de encerramento

> “Concluímos login com Context e rotas protegidas, três CRUDs — visitantes, reservas e usuários — e um relatório com JOIN entre reserva, visitante e morador. O código está modularizado e o projeto executa de ponta a ponta.”

### Perguntas prováveis

**Como funciona o JOIN?**  
Chaves simuladas (`createdBy`, `linkedVisitorIds`, `authorizedBy`); no React usamos `find` e `map` para cruzar listas; na tela de relatório a API devolve dados já relacionados.

**O join é no React ou no backend?**  
Os dois: a tela consome a API enriquecida; `condoQueries.ts` demonstra join client-side com `find` + `map` + `filter`.

---

## Resumo — divisão da equipe

| Pessoa | Tema | Dificuldade | Critério |
|--------|------|-------------|----------|
| **1** | Visão geral + arquitetura | Baixa | Organização |
| **2** | Login + rotas protegidas | Baixa | Login 0,5 |
| **3** | CRUD Visitantes | Média | CRUD 1 — 0,5 |
| **4** | CRUD Reservas | Média-Alta | CRUD 2 — 0,5 |
| **5** | CRUD Usuários + Context | Média | CRUD 3 — 0,5 |
| **6** | Relatório JOIN + fechamento | Alta | Relatório — 0,5 |

---

## Penalidades — como evitar

| Penalidade | Como o Vyzin evita |
|------------|-------------------|
| Projeto não executa (−1,5) | Testar backend + frontend no dia anterior |
| CRUD sem map() ou sem estado (−0,25) | Mostrar `.map()` e `useState` nas três demos |
| Login inexistente (zera login) | Demo completa: login → logout → bloqueio de rota |
| Código todo no App.jsx (−1,0) | Pessoa 1 mostra estrutura `pages/`, `modules/`, `contexts/`, `router/` |

---

## Perguntas gerais que podem cair na oral

| Pergunta | Resposta sugerida |
|----------|-------------------|
| O que é Context API? | Mecanismo do React para compartilhar estado (usuário, funções) sem passar props em cada nível |
| Por que usar react-router-dom? | Cada tela tem URL própria; guards bloqueiam acesso sem permissão |
| O professor pediu localStorage — vocês usam? | Estado no Context + token Firebase; dados CRUD persistem via API no Firestore (acima do mínimo) |
| Quantos CRUDs vocês têm? | Três principais na apresentação: Visitantes, Reservas, Usuários (+ Mural como extra) |
| O que simula chave estrangeira? | `createdBy`, `authorizedBy`, `linkedVisitorIds` ligam reserva, visitante e usuário |

---

## Referências no repositório

- [docs/CASOS_DE_USO.md](./CASOS_DE_USO.md) — fluxos detalhados por persona
- [docs/REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md) — regras de domínio e RBAC
- [docs/SETUP_TESTE.md](./SETUP_TESTE.md) — roteiro de testes manuais
- [backend/requests.http](../backend/requests.http) — exemplos de API incluindo relatório
