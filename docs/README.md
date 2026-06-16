# Documentação Vyzin

Índice central da documentação do projeto **Vyzin** — sistema de gestão condominial (MVP).

**Última atualização:** junho/2026

## Documentos

| Documento | Público-alvo | Conteúdo |
|-----------|--------------|----------|
| **[PRODUTO_E_PROJETO.md](./PRODUTO_E_PROJETO.md)** | Product owners, stakeholders, professores | Visão do produto, escopo do MVP, personas, roadmap |
| **[REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md)** | Analistas, QA, desenvolvedores | Regras de domínio, RBAC, ownership, validações |
| **[DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md)** | Desenvolvedores | Arquitetura, persistência, API, frontend, modelo de dados |
| **[CASOS_DE_USO.md](./CASOS_DE_USO.md)** | Todos | Casos de uso, fluxos, diagramas UML (Mermaid) |
| **[SETUP_TESTE.md](./SETUP_TESTE.md)** | Desenvolvedores / QA | Firebase, seed, usuários de teste e roteiro manual |
| **[APRESENTACAO_N2.md](./APRESENTACAO_N2.md)** | Equipe / apresentação | Roteiro N2 React: login, 3 CRUDs, relatório JOIN (6 integrantes) |

## Leitura recomendada

**Quero entender o que é o Vyzin** → [PRODUTO_E_PROJETO.md](./PRODUTO_E_PROJETO.md)

**Quero saber o que o sistema permite ou proíbe** → [REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md)

**Quero desenvolver ou dar manutenção** → [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md) + [SETUP_TESTE.md](./SETUP_TESTE.md)

**Quero testar cenários de usuário** → [CASOS_DE_USO.md](./CASOS_DE_USO.md) + [SETUP_TESTE.md](./SETUP_TESTE.md)

**Quero preparar a apresentação N2 (React)** → [APRESENTACAO_N2.md](./APRESENTACAO_N2.md)

## Repositório

```
vyzin/
├── frontend/          # React + Vite + react-router-dom + Tailwind + shadcn/ui (porta 3001)
├── backend/           # NestJS + camada persistence + Firebase Admin SDK (porta 3000)
├── docs/              # Esta pasta
└── Vyzin 1.0/         # Protótipo Figma (referência visual, não integrado)
```

## Módulos funcionais (MVP)

| Módulo | Backend | Frontend (rota) |
|--------|---------|-----------------|
| Painel | — | `/dashboard` |
| Reservas | `/reservations` | `/reservations` |
| Visitantes | `/visitors` | `/visitantes` |
| Mural | `/announcements` | `/mural` |
| Relatório | `/reports/operational` | `/relatorio` |
| Informações | — (estático) | `/informacoes` |
| Segurança | `/users`, `/profiles` | `/seguranca/usuarios`, `/seguranca/perfis` |

## Execução rápida

Ver [README.md](../README.md) na raiz do repositório.
