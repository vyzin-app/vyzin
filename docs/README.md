# Documentação Vyzin

Índice central da documentação do projeto **Vyzin** — sistema de gestão condominial (MVP).

## Documentos

| Documento | Público-alvo | Conteúdo |
|-----------|--------------|----------|
| **[PRODUTO_E_PROJETO.md](./PRODUTO_E_PROJETO.md)** | Product owners, stakeholders, professores | Visão do produto, escopo do MVP, personas, roadmap e contexto acadêmico |
| **[REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md)** | Analistas, QA, desenvolvedores | Regras de domínio, RBAC, perfis, ownership e validações |
| **[DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md)** | Desenvolvedores | Arquitetura, código, API, modelo de dados, autenticação |
| **[CASOS_DE_USO.md](./CASOS_DE_USO.md)** | Todos | Casos de uso, fluxos, diagramas UML (Mermaid) |
| **[SETUP_TESTE.md](./SETUP_TESTE.md)** | Desenvolvedores / QA | Firebase, seed, usuários de teste e roteiro manual |

## Leitura recomendada

**Quero entender o que é o Vyzin** → [PRODUTO_E_PROJETO.md](./PRODUTO_E_PROJETO.md)

**Quero saber o que o sistema permite ou proíbe** → [REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md)

**Quero desenvolver ou dar manutenção** → [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md) + [SETUP_TESTE.md](./SETUP_TESTE.md)

**Quero testar cenários de usuário** → [CASOS_DE_USO.md](./CASOS_DE_USO.md) + [SETUP_TESTE.md](./SETUP_TESTE.md)

## Repositório

```
vyzin/
├── frontend/     # React + Vite + Tailwind + shadcn/ui (porta 3001)
├── backend/      # NestJS + Firebase Admin SDK (porta 3000)
├── docs/         # Esta pasta
└── Vyzin 1.0/    # Protótipo Figma (referência visual, não integrado)
```

## Execução rápida

Ver [README.md](../README.md) na raiz do repositório.
