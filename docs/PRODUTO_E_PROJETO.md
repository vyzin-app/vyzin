# Vyzin — Produto e Projeto

**Versão:** MVP integrado (frontend + backend + Firebase)  
**Última atualização:** junho/2026

---

## 1. O que é o Vyzin

O **Vyzin** é uma plataforma web para **gestão condominial**, pensada para centralizar rotinas do dia a dia de síndicos, porteiros e moradores em um único painel.

No estágio atual (MVP), o foco está em:

- **Reservas** de áreas comuns (salão, churrasqueira, quadra, sala de reuniões)
- **Controle de visitantes** (cadastro, autorização na portaria, registro de saída)
- **Mural de avisos** (comunicados, manutenções, eventos)
- **Informações do condomínio** (regras e contatos — conteúdo estático no MVP)
- **Gestão de usuários e perfis** (RBAC dinâmico)

O produto nasce no contexto de disciplinas de **Arquitetura de Software** e **Programação Web**, com requisitos explícitos de separação em camadas, MVC e persistência em nuvem.

---

## 2. Problema e proposta de valor

### Problema

Condomínios de médio porte costumam operar com planilhas, grupos de mensagem e cadernos na portaria. Isso gera:

- Falta de rastreabilidade (quem autorizou um visitante? quem reservou o salão?)
- Comunicação fragmentada (avisos perdidos em grupos)
- Dificuldade de definir **quem pode fazer o quê** (morador vs porteiro vs administrador)

### Proposta de valor

| Benefício | Como o Vyzin entrega |
|-----------|----------------------|
| Centralização | Um painel web com módulos integrados |
| Segurança operacional | RBAC por perfil + funções granulares |
| Rastreabilidade | Registros persistidos no Firestore com autor e timestamps |
| Escalabilidade de permissões | Perfis editáveis sem alterar código |

---

## 3. Personas e perfis padrão

O MVP trabalha com três personas principais, materializadas como **perfis de sistema** no seed:

| Persona | Perfil (`profileId`) | Responsabilidades típicas |
|---------|----------------------|---------------------------|
| **Administrador / Síndico** | `admin` | Gestão completa: usuários, perfis, avisos, reservas de qualquer morador |
| **Porteiro** | `doorman` | Autorizar visitantes, consultar reservas, cadastrar visitantes, consultar usuários |
| **Morador** | `resident` | Reservar áreas comuns, cadastrar visitantes, vincular convidados a reservas, ler avisos |

Usuários de demonstração (após `npm run seed`):

| E-mail | Senha | Apartamento |
|--------|-------|-------------|
| admin@vyzin.com | admin123 | 301, Bloco A |
| porteiro@vyzin.com | porteiro123 | — |
| morador@vyzin.com | morador123 | 114, Bloco M |

---

## 4. Escopo do MVP

### Dentro do escopo (implementado)

- [x] Autenticação Firebase (e-mail/senha) no frontend
- [x] API REST NestJS com validação de token e RBAC
- [x] CRUD de reservas, visitantes, avisos, usuários e perfis
- [x] Workflow de visitantes (aguardando → autorizado / negado → saída)
- [x] Vínculo reserva ↔ visitantes convidados (`linkedVisitorIds`)
- [x] Seed idempotente com dados demo
- [x] Interface React com navegação por permissões

### Fora do escopo (MVP)

- [ ] Módulo financeiro (taxas, boletos)
- [ ] Reservas com detecção automática de conflito de horário
- [ ] Notificações push / e-mail
- [ ] App mobile nativo
- [ ] API de Informações do condomínio (conteúdo editável persistido)
- [ ] Encomendas, ocorrências, votação de assembleia
- [ ] Multi-condomínio (tenant isolation)

### Protótipo visual

A pasta `Vyzin 1.0/` contém export do Figma com telas adicionais (analytics, energia, etc.). **Não está integrada ao backend** — serve como referência de UI/UX futura.

---

## 5. Módulos funcionais (visão de produto)

```mermaid
mindmap
  root((Vyzin MVP))
    Reservas
      Áreas comuns
      Status confirmada/cancelada
      Convidados vinculados
    Visitantes
      Visita ao apartamento
      Convidado de evento
      Workflow portaria
    Mural
      Categorias
      Fixar aviso
      Importante
    Administração
      Usuários
      Perfis RBAC
    Informações
      Regras estáticas
      Contatos
```

---

## 6. Contexto de projeto (acadêmico)

### Objetivos de aprendizagem atendidos

| Requisito | Realização |
|-----------|------------|
| Arquitetura em camadas | Frontend (apresentação) + Backend (negócio + dados) |
| MVC | Controllers/Services no Nest; React como View; Firestore como persistência |
| Monólito modular | Um processo NestJS com módulos por domínio |
| Banco na nuvem | Firestore via Firebase Admin SDK |
| SOLID / GRASP | Inversão de dependência (`AuthService`), coesão por domínio, `Information Expert` nos perfis |

### Stack tecnológica

| Camada | Tecnologias |
|--------|-------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, Radix UI |
| Backend | NestJS, TypeScript, class-validator, Firebase Admin SDK |
| Infra | Firebase Auth + Firestore (projeto `vyzin-app`) |
| Ferramentas | ESLint, Jest (backend), `requests.http` para testes manuais de API |

---

## 7. Roadmap sugerido (pós-MVP)

Priorização sugerida para evolução do produto:

1. **Informações persistidas** — backend + editor na tela Informações
2. **Conflito de reservas** — validar sobreposição de horário por espaço
3. **ProfileManagement no frontend** — migrar componente do protótipo Figma
4. **Notificações** — aviso novo, visitante aguardando autorização
5. **Relatórios** — export CSV/PDF de visitantes e reservas
6. **Multi-condomínio** — `condoId` em todas as coleções

---

## 8. Métricas de sucesso (MVP)

| Métrica | Meta |
|---------|------|
| Fluxo login → dashboard | < 3 s em ambiente local |
| Cobertura de RBAC | Toda rota protegida por função no backend |
| Seed reproduzível | `npm run seed` idempotente |
| Documentação | Domínio, técnica, casos de uso e setup descritos |

---

## 9. Glossário

| Termo | Significado no Vyzin |
|-------|---------------------|
| **Perfil** | Conjunto nomeado de funções (`profiles/{id}`). Define o que o usuário pode fazer. |
| **Função** | Capacidade atômica (`reservations:read`, etc.), mapeada a endpoints. |
| **Usuário** | Pessoa com conta Firebase + documento Firestore (`users/{uid}`). |
| **Custom claim** | Metadado no token Firebase: `{ profileId }`. |
| **Workflow** | Transições de estado de visitante (autorizar, negar, registrar saída). |
| **Ownership** | Regra em que morador só altera registros criados por ele (`createdBy`). |

---

## 10. Referências internas

- [REGRAS_DE_NEGOCIO.md](./REGRAS_DE_NEGOCIO.md)
- [DOCUMENTACAO_TECNICA.md](./DOCUMENTACAO_TECNICA.md)
- [CASOS_DE_USO.md](./CASOS_DE_USO.md)
- [SETUP_TESTE.md](./SETUP_TESTE.md)
