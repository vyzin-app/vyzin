# Vyzin

Sistema de gestão de condomínios (MVP) — monorepo com **React** (frontend) e **NestJS** (backend), usando **Firebase** (Authentication no cliente, Firestore via Admin SDK no servidor).

## Documentação académica e técnica

A descrição detalhada da arquitetura, mapeamento MVC, organização do código backend e frontend, diagramas e evolução recomendada encontra-se em:

**[docs/DOCUMENTACAO_TECNICA.md](docs/DOCUMENTACAO_TECNICA.md)**

## Execução rápida

### Backend

```bash
cd backend
cp .env.example .env   # ajustar PORT e credenciais Firebase
npm install
npm run start:dev
```

Por omissão o servidor HTTP usa a porta **3000** (ou o valor de `PORT` no `.env`). É necessário configurar credenciais da conta de serviço (ver `.env.example` e `firebase-key.json` local, nunca commitado).

### Frontend

```bash
cd frontend
cp .env.example .env   # preencher REACT_APP_FIREBASE_* e opcionalmente PORT=3001
npm install
npm start
```

O Create React App expõe apenas variáveis com prefixo **`REACT_APP_`**.

## Licença

Ver [LICENSE](LICENSE).
