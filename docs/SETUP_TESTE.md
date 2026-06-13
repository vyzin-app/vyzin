# Setup para testar o Vyzin (dados de exemplo)

Documentação relacionada: [índice](./README.md) · [casos de uso](./CASOS_DE_USO.md) · [regras de negócio](./REGRAS_DE_NEGOCIO.md)

## 1. Firebase (uma vez)

1. [Firebase Console — vyzin-app](https://console.firebase.google.com/project/vyzin-app)
2. **Authentication** → Sign-in method → habilite **E-mail/senha**
3. **Firestore Database** → **Criar banco de dados** → escolha região → concluir  
   (Se aparecer erro `SERVICE_DISABLED`, aguarde 1–2 min após criar o banco.)

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
cp .env.example .env   # ja preenchido se voce clonou apos o seed local
npm install
```

Reinicie o `npm run dev` do frontend apos criar/alterar o `.env`.

## 4. Popular o banco (perfis, usuarios, dados demo)

```bash
cd backend
npm run seed
```

Isso cria:

| Tipo | Conteudo |
|------|----------|
| **Perfis** | Administrador (todas funcoes), Porteiro, Morador |
| **Usuarios** | admin@vyzin.com, porteiro@vyzin.com, morador@vyzin.com |
| **Reservas** | Salao (com 2 convidados vinculados), churrasqueira, cancelada, sala reuniao |
| **Visitantes** | Aguardando (porteiro autoriza), autorizado, saida registrada, 2 convidados da festa |
| **Avisos** | Manutencao (fixado), assembleia, horario piscina |

Senhas: `admin123`, `porteiro123`, `morador123`.

## 5. Subir aplicacao

Terminal 1:

```bash
cd backend && npm run start:dev
```

Terminal 2:

```bash
cd frontend && npm run dev
```

Abra **http://localhost:3001** e faca login.

## Cenarios de teste sugeridos

| Perfil | O que testar |
|--------|----------------|
| **Morador** | Ver reservas proprias; criar visitante; ver avisos |
| **Porteiro** | Autorizar visitante "Ana Paula" (status waiting); ver reservas read-only |
| **Admin** | CRUD avisos; gestao de usuarios e perfis; editar qualquer reserva |

## Reexecutar seed

O script e **idempotente** (mesmos ids fixos). Pode rodar de novo:

```bash
cd backend && npm run seed
```
