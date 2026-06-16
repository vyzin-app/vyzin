# Setup para testar o Vyzin

Guia passo a passo para subir o ambiente, popular dados de exemplo e validar manualmente.

Documentação relacionada: [índice](./README.md) · [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md) · [TESTES.md](./TESTES.md)

**Última atualização:** junho/2026

---

## 1. Escolha do ambiente

| Modo | Quando usar | Prós | Contras |
|------|-------------|------|---------|
| **Emuladores (recomendado)** | Desenvolvimento e QA local | Sem cota Firestore; sem `firebase-key.json` | Dados não persistem entre reinícios do emulador* |
| **Firebase real** | Demo em nuvem / produção | Dados persistentes na nuvem | Exige credenciais; cota do projeto |

\* Reiniciar emuladores apaga dados — rode `npm run seed:local` novamente.

---

## 2. Setup com emuladores (recomendado)

### Pré-requisitos

- Node.js 18+
- npm

### Passo 1 — Instalar dependências

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Passo 2 — Configurar variáveis de ambiente

```bash
cd backend
cp .env.example .env
# .env já aponta para emuladores (FIRESTORE_EMULATOR_HOST, etc.)

cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000
```

### Passo 3 — Subir emuladores Firebase

**Terminal 1:**

```bash
cd backend
npm run emulators
```

Aguarde até ver `All emulators ready`. UI: http://localhost:4000

### Passo 4 — Subir backend

**Terminal 2:**

```bash
cd backend
npm run start:dev:local
```

API: http://localhost:3000

### Passo 5 — Popular dados (primeira vez ou após reset do emulador)

**Terminal 3:**

```bash
cd backend
npm run seed:local
```

### Passo 6 — Subir frontend

**Terminal 4:**

```bash
cd frontend
npm run dev
```

App: http://localhost:3001

### Passo 7 — Login

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@vyzin.com | admin123 | Administrador |
| porteiro@vyzin.com | porteiro123 | Porteiro |
| morador@vyzin.com | morador123 | Morador |

---

## 3. Setup com Firebase real (produção / demo nuvem)

### Passo 1 — Console Firebase

1. [Firebase Console — vyzin-app](https://console.firebase.google.com/project/vyzin-app)
2. **Authentication** → Sign-in method → habilite **E-mail/senha**
3. **Firestore Database** → criar banco (se ainda não existir)

### Passo 2 — Credenciais backend

```bash
cd backend
cp .env.example .env
```

Em `.env`:

- **Comente ou remova** as variáveis de emulador (`FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`)
- Configure `FIREBASE_WEB_API_KEY` (Web API Key do Console)
- Coloque `firebase-key.json` na pasta `backend/` **ou** defina `GOOGLE_APPLICATION_CREDENTIALS`

```bash
npm install
```

### Passo 3 — Frontend

```bash
cd frontend
cp .env.example .env
npm install
```

### Passo 4 — Seed

```bash
cd backend
npm run seed
```

> Se aparecer `RESOURCE_EXHAUSTED: Quota exceeded`, use os **emuladores** (seção 2) ou aguarde liberação de cota no projeto Firebase.

### Passo 5 — Subir aplicação

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

---

## 4. O que o seed cria

| Tipo | Conteúdo |
|------|----------|
| **Perfis** | Administrador (todas funções), Porteiro, Morador |
| **Usuários** | admin@vyzin.com, porteiro@vyzin.com, morador@vyzin.com |
| **Reservas** | Salão (2 convidados), churrasqueira, cancelada, sala reunião |
| **Visitantes** | Aguardando, autorizado, saída, 2 convidados da festa |
| **Avisos** | Manutenção (fixado), assembleia, horário piscina |
| **Informações** | Contatos, regras, documentos, endereço do condomínio |

Senhas: `admin123`, `porteiro123`, `morador123`.

### Importante — recarregar permissões

Após seed ou alteração de perfis no Firestore, faça **logout e login** no frontend para recarregar as funções do perfil.

O seed é **idempotente** e **mescla** novas funções em perfis existentes. O perfil `admin` sempre recebe o catálogo completo.

---

## 5. Cenários de teste sugeridos

| Perfil | O que testar |
|--------|--------------|
| **Morador** | Criar reserva (slot disponível); cadastrar visitante (data ≥ hoje); pré-autorizados; relatório (dados próprios); mural; informações |
| **Porteiro** | Autorizar visitante aguardando; ver todas as reservas; workflow negar/saída; relatório ampliado |
| **Admin** | CRUD avisos; editar Informações; Segurança → Usuários/Perfis; editar reserva alheia; export CSV do relatório |

### Visitantes — validação de data

- Não é possível cadastrar visita com **data anterior a hoje** (backend + UI)
- No dia atual, **horários já passados** ficam desabilitados na UI

### Reservas — validação de data

- Não é possível criar reserva com **data passada**

### Relatório operacional

1. Login como morador → menu **Relatório** → ver apenas dados próprios
2. Login como porteiro → ver reservas/visitantes ampliados
3. Filtros: período, status, espaço, busca
4. Export CSV nas abas Reservas e Visitantes

### Informações do condomínio

1. Login como morador → visualizar `/informacoes`
2. Login como admin → botão **Editar** → alterar contatos/regras → salvar via API

### Pré-autorizados

1. Login como morador → **Visitantes** → aba **Pré-autorizados**
2. Cadastrar diarista/familiar recorrente
3. Porteiro/admin não vê registros de outros moradores (escopo `createdBy`)

---

## 6. Testar API com REST Client

Arquivo: `backend/requests.http`

1. Envie `POST /auth/login` com credenciais de teste
2. Copie o cookie `vyzin_session` da resposta (ou use extensão REST Client com suporte a cookies)
3. Demais requisições usarão o cookie automaticamente se configurado

Alternativa: use `Authorization: Bearer <idToken>` (menos comum no fluxo normal da app).

---

## 7. Testes automatizados

```bash
cd backend && npm test && npm run test:e2e
cd frontend && npm test
```

Detalhes: [TESTES.md](./TESTES.md).

---

## 8. Solução de problemas

| Problema | Causa provável | Solução |
|----------|----------------|---------|
| 401 em todas as rotas | Cookie expirado ou backend reiniciado | Faça login novamente |
| Menu sem **Relatório** | Funções desatualizadas no frontend | Logout + login após seed |
| `ECONNREFUSED :8080` | Emulador Firestore não rodando | `npm run emulators` no backend |
| `Quota exceeded` no seed real | Cota Firestore esgotada | Use emuladores (`seed:local`) |
| CORS error | `FRONTEND_ORIGIN` incorreto | Confirme `http://localhost:3001` no `.env` backend |
| Dados sumiram | Emulador reiniciado | Rode `npm run seed:local` de novo |

---

## 9. IDs de demonstração (seed)

| Cenário | ID aproximado | Regra exercitada |
|---------|---------------|------------------|
| Visitante aguardando | `demo-visitor-waiting` | Workflow portaria |
| Festa com convidados | `demo-reservation-party` + visitantes | `linkedVisitorIds` |
| Reserva cancelada | `demo-reservation-cancelled` | Status `cancelled` |
| Churrasqueira livre | `demo-reservation-churrasqueira` | Vincular novo convidado |

IDs exatos podem variar — consulte Firestore Emulator UI (http://localhost:4000) ou listagens na API.
