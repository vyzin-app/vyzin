# Vyzin — Backend (NestJS)

API REST do **Vyzin** — gestão condominial com Firebase Auth, Firestore e RBAC por perfis.

Documentação completa: [docs/DOCUMENTACAO_TECNICA.md](../docs/DOCUMENTACAO_TECNICA.md)

## Requisitos

- Node.js 18+
- Projeto Firebase `vyzin-app` com Auth (e-mail/senha) e Firestore
- `firebase-key.json` na pasta `backend/` (ou variáveis em `.env`)

## Setup

```bash
cp .env.example .env
npm install
npm run seed        # perfis, usuários e dados demo
npm run start:dev   # http://localhost:3000
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run start:dev` | Servidor com hot-reload |
| `npm run build` | Compila TypeScript |
| `npm run seed` | Bootstrap idempotente (perfis + demo) |
| `npm run test` | Testes unitários (Jest) |
| `npm run test:e2e` | Testes e2e |

## Estrutura principal

```
src/
├── auth/           # Guards, decorators, catálogo AppFunction
├── firebase/       # Admin SDK
├── persistence/    # Repository genérico + security scopes
├── profiles/       # RBAC — perfis
├── users/          # Usuários + provisioning Firebase Auth
├── reservas/       # Reservas + slots + vínculo visitantes
├── visitantes/     # Visitantes + workflow portaria
├── mural/          # Avisos
├── reports/        # Relatório operacional (joins)
├── scripts/seed.ts
├── app.module.ts
└── main.ts
```

## Testes manuais de API

Use `requests.http` com a extensão REST Client (VS Code/Cursor). Obtenha um ID token Firebase após login no frontend ou via Identity Toolkit API.

## Usuários de teste (após seed)

| E-mail | Senha | Perfil |
|--------|-------|--------|
| admin@vyzin.com | admin123 | Administrador |
| porteiro@vyzin.com | porteiro123 | Porteiro |
| morador@vyzin.com | morador123 | Morador |

Após alterar funções de perfil no seed, faça **logout/login** no frontend para recarregar permissões.
