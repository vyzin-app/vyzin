# Vyzin

Sistema de gestão de condomínios (MVP) — monorepo com **React + TypeScript + Vite** (frontend) e **NestJS** (backend), com **Firebase Auth** no cliente e **Firestore** via Admin SDK no servidor. RBAC dinâmico por **perfis** e **funções**.

## Funcionalidades principais

- Reservas de áreas comuns (validação de horários, vínculo de convidados)
- Controle de visitantes (workflow na portaria)
- Mural de avisos
- Relatório operacional com joins (reservas ↔ visitantes ↔ usuários ↔ perfis)
- Gestão de usuários e perfis RBAC

## Documentação

| Documento | Descrição |
|-----------|-----------|
| **[docs/README.md](docs/README.md)** | Índice central da documentação |
| **[docs/PRODUTO_E_PROJETO.md](docs/PRODUTO_E_PROJETO.md)** | Visão de produto, personas, escopo e roadmap |
| **[docs/REGRAS_DE_NEGOCIO.md](docs/REGRAS_DE_NEGOCIO.md)** | Regras de domínio, RBAC e validações |
| **[docs/DOCUMENTACAO_TECNICA.md](docs/DOCUMENTACAO_TECNICA.md)** | Arquitetura, código, API e modelo de dados |
| **[docs/CASOS_DE_USO.md](docs/CASOS_DE_USO.md)** | Casos de uso, fluxos e diagramas |
| **[docs/SETUP_TESTE.md](docs/SETUP_TESTE.md)** | Firebase, seed e roteiro de testes |
| **[docs/APRESENTACAO_N2.md](docs/APRESENTACAO_N2.md)** | Roteiro de apresentação N2 (6 integrantes) |

## Execução rápida

### 1. Backend

```bash
cd backend
cp .env.example .env
# firebase-key.json na pasta backend/ (ver .env.example)
npm install
npm run seed      # perfis, usuarios e dados demo no Firestore
npm run start:dev # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev       # http://localhost:3001
```

### Usuários de teste (após `npm run seed`)

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@vyzin.com | admin123 | Administrador |
| porteiro@vyzin.com | porteiro123 | Porteiro |
| morador@vyzin.com | morador123 | Morador (Apto 114, Bloco M) |

Após `npm run seed`, faça **logout e login** no frontend para recarregar funções de perfil atualizadas (ex.: acesso ao Relatório).

## Licença

Ver [LICENSE](LICENSE).
