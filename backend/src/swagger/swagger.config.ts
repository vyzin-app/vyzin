import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SESSION_COOKIE_NAME } from '../auth/constants/session.constants';
import { BEARER_AUTH_SCHEME } from './swagger.constants';

const API_DESCRIPTION = `
<p>API REST do <strong>Vyzin</strong> — gestão condominial (reservas, visitantes, mural, relatórios).</p>

<h3>Passo a passo para testar</h3>
<ol>
  <li>Abra a tag <strong>Auth</strong> → endpoint <code>POST /auth/login</code></li>
  <li>Clique em <strong>Try it out</strong></li>
  <li>Envie o body de exemplo (ou use <code>admin@vyzin.com</code> / <code>admin123</code>)</li>
  <li>Clique em <strong>Execute</strong> — o cookie de sessão é gravado no navegador</li>
  <li>Teste os demais endpoints; a autenticação já estará ativa</li>
</ol>

<h3>Botão Authorize (cadeado)</h3>
<p>Na maioria dos casos <strong>não precisa clicar</strong> — basta fazer login em <code>POST /auth/login</code>.</p>
<ul>
  <li><strong>${SESSION_COOKIE_NAME}</strong> — só preencha se quiser colar manualmente o valor do cookie (DevTools → Application → Cookies)</li>
  <li><strong>bearer</strong> — opcional; cole um Firebase ID token se não usar cookie</li>
</ul>

<h3>Usuários de teste (após seed)</h3>
<table>
  <tr><th>E-mail</th><th>Senha</th><th>Perfil</th></tr>
  <tr><td>admin@vyzin.com</td><td>admin123</td><td>Administrador</td></tr>
  <tr><td>porteiro@vyzin.com</td><td>porteiro123</td><td>Porteiro</td></tr>
  <tr><td>morador@vyzin.com</td><td>morador123</td><td>Morador</td></tr>
</table>

<h3>Autorização (RBAC)</h3>
<p>Rotas protegidas exigem funções do perfil. Catálogo em <code>GET /functions</code> (requer profiles:read).</p>
`.trim();

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Vyzin API')
    .setDescription(API_DESCRIPTION)
    .setVersion('1.0')
    .addTag('Health', 'Verificação de disponibilidade')
    .addTag('Auth', 'Login, logout e sessão — comece por aqui')
    .addTag('Functions', 'Catálogo de funções RBAC')
    .addTag('Profiles', 'Perfis e permissões')
    .addTag('Users', 'Usuários do condomínio')
    .addTag('Reservations', 'Reservas de áreas comuns')
    .addTag('Visitors', 'Visitantes e workflow da portaria')
    .addTag('PreAuthorizations', 'Pré-autorizados (diaristas, familiares)')
    .addTag('Announcements', 'Mural de avisos')
    .addTag('Information', 'Informações do condomínio')
    .addTag('Reports', 'Relatório operacional')
    .addCookieAuth(SESSION_COOKIE_NAME, {
      type: 'apiKey',
      in: 'cookie',
      name: SESSION_COOKIE_NAME,
      description:
        'Preenchido automaticamente após POST /auth/login. Ou cole o valor manualmente.',
    })
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Firebase ID token — alternativa ao cookie (opcional)',
      },
      BEARER_AUTH_SCHEME,
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    customSiteTitle: 'Vyzin API — Documentação',
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
    },
  });
}
