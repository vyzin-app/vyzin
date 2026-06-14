# Setup para testar o Vyzin (dados de exemplo)

Documentação relacionada: [índice](./README.md) · [casos de uso](./CASOS_DE_USO.md) · [regras de negócio](./REGRAS_DE_NEGOCIO.md)

**Última atualização:** junho/2026

## 1. Firebase (uma vez)

1. [Firebase Console — vyzin-app](https://console.firebase.google.com/project/vyzin-app)
2. **Authentication** → Sign-in method → habilite **E-mail/senha**
3. **Firestore Database** → **Criar banco de dados** → escolha região → concluir

## 2. Credenciais do backend

```bash
cd backend
cp .env.example .env
# Coloque firebase-key.json na pasta backend/ (nao commitar)
npm install
```

## 3. Credenciais do frontend

```bash
cd frontend
cp .env.example .env
npm install
```

Reinicie o `npm run dev` do frontend após criar/alterar o `.env`.

## 4. Popular o banco (perfis, usuarios, dados demo)

```bash
cd backend
npm run seed
```

Isso cria/atualiza:

| Tipo | Conteudo |
|------|----------|
| **Perfis** | Administrador (todas funcoes), Porteiro, Morador — **inclui `reports:read`** |
| **Usuarios** | admin@vyzin.com, porteiro@vyzin.com, morador@vyzin.com |
| **Reservas** | Salao (2 convidados), churrasqueira, cancelada, sala reuniao |
| **Visitantes** | Aguardando, autorizado, saida, 2 convidados da festa |
| **Avisos** | Manutencao (fixado), assembleia, horario piscina |

Senhas: `admin123`, `porteiro123`, `morador123`.

> **Importante:** após o seed (ou alteração de perfis), faça **logout e login** no frontend para recarregar as funções do perfil. Sem isso, itens como **Relatório** podem não aparecer no menu.

O seed é **idempotente** e **mescla** novas funções em perfis existentes. O perfil `admin` sempre recebe o catálogo completo.

## 5. Subir aplicacao

Terminal 1:

```bash
cd backend && npm run start:dev
```

Terminal 2:

```bash
cd frontend && npm run dev
```

Abra **http://localhost:3001** e faça login.

## 6. Cenarios de teste sugeridos

| Perfil | O que testar |
|--------|----------------|
| **Morador** | Criar reserva (slot disponível); vincular visitante à churrasqueira; relatório (dados próprios); mural |
| **Porteiro** | Autorizar Ana Paula (`demo-visitor-waiting`); ver todas as reservas; relatório ampliado |
| **Admin** | CRUD avisos; Segurança → Usuários/Perfis; editar reserva alheia; export CSV do relatório |

### Relatório operacional

1. Menu **Relatório** ou Painel → **Relatório Operacional**
2. Período padrão: últimos 30 dias
3. Abas **Reservas** e **Visitantes** — verificar joins (solicitante, autorizador, convidados)
4. Botões **CSV Reservas** / **CSV Visitantes**

### Vincular visitante à reserva

1. Morador → **Reservas** → expandir **Churrasqueira 2**
2. **Adicionar Visitante** → aba **Cadastrar Novo** ou **Visitante Existente**
3. Confirmar convidado na lista da reserva

## 7. Reexecutar seed

```bash
cd backend && npm run seed
```

Depois: **logout/login** no frontend.

## 8. Testes de API manuais

Arquivo `backend/requests.http` — inclui exemplos de reservas, visitantes, vínculo, relatório e filtros `search`.

## 9. Verificacao de build

```bash
cd backend && npm run build
cd frontend && npm run build
```
