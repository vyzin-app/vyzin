import { INestApplication } from '@nestjs/common';
import { AppFunction } from '../src/auth/functions/app-functions';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './support/create-test-app';
import { authHeader } from './support/test-auth.guard';

function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

describe('Vyzin API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health', () => {
    it('GET /', () => {
      return request(app.getHttpServer()).get('/').expect(200);
    });
  });

  describe('Auth', () => {
    it('POST /auth/login authenticates via backend', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'morador@test.com', password: 'morador123' })
        .expect(200);

      expect(response.body.user.profileId).toBe('resident');
      expect(response.body.profile.functions).toContain(
        AppFunction.RESERVATIONS_MANAGE,
      );
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('POST /auth/logout clears session', () => {
      return request(app.getHttpServer()).post('/auth/logout').expect(200);
    });

    it('GET /auth/me returns test user profile', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(res.body.user.profileId).toBe('resident');
          expect(res.body.profile.id).toBe('resident');
        });
    });
  });

  describe('Functions', () => {
    it('GET /functions lists catalog for admin', () => {
      return request(app.getHttpServer())
        .get('/functions')
        .set('Authorization', authHeader('admin'))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(10);
        });
    });
  });

  describe('Information', () => {
    it('GET /information returns seeded condo data', () => {
      return request(app.getHttpServer())
        .get('/information')
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(res.body.address.name).toBe('Residencial Vyzin');
          expect(res.body.contacts.length).toBeGreaterThan(0);
        });
    });

    it('PUT /information updates condo data as admin', async () => {
      const current = await request(app.getHttpServer())
        .get('/information')
        .set('Authorization', authHeader('admin'))
        .expect(200);

      await request(app.getHttpServer())
        .put('/information')
        .set('Authorization', authHeader('admin'))
        .send({
          contacts: current.body.contacts,
          rules: current.body.rules,
          documents: current.body.documents,
          address: current.body.address,
          notice: 'Aviso atualizado via e2e',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.notice).toBe('Aviso atualizado via e2e');
        });
    });

    it('PUT /information is forbidden for resident', async () => {
      const current = await request(app.getHttpServer())
        .get('/information')
        .set('Authorization', authHeader('resident'))
        .expect(200);

      await request(app.getHttpServer())
        .put('/information')
        .set('Authorization', authHeader('resident'))
        .send({
          contacts: current.body.contacts,
          rules: current.body.rules,
          documents: current.body.documents,
          address: current.body.address,
        })
        .expect(403);
    });
  });

  describe('Profiles', () => {
    let customProfileId: string;

    it('GET /profiles lists profiles', () => {
      return request(app.getHttpServer())
        .get('/profiles')
        .set('Authorization', authHeader('admin'))
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBeGreaterThanOrEqual(3);
        });
    });

    it('GET /profiles/:id returns admin profile', () => {
      return request(app.getHttpServer())
        .get('/profiles/admin')
        .set('Authorization', authHeader('admin'))
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe('admin');
        });
    });

    it('POST /profiles creates custom profile', async () => {
      const response = await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', authHeader('admin'))
        .send({
          name: 'Perfil E2E',
          description: 'Criado nos testes',
          functions: [AppFunction.RESERVATIONS_READ],
        })
        .expect(201);

      customProfileId = response.body.id;
      expect(customProfileId).toBeTruthy();
    });

    it('PUT /profiles/:id updates custom profile', () => {
      return request(app.getHttpServer())
        .put(`/profiles/${customProfileId}`)
        .set('Authorization', authHeader('admin'))
        .send({
          name: 'Perfil E2E Atualizado',
          description: 'Alterado',
          functions: [
            AppFunction.RESERVATIONS_READ,
            AppFunction.VISITORS_READ,
          ],
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Perfil E2E Atualizado');
        });
    });

    it('DELETE /profiles/:id removes custom profile', () => {
      return request(app.getHttpServer())
        .delete(`/profiles/${customProfileId}`)
        .set('Authorization', authHeader('admin'))
        .expect(204);
    });
  });

  describe('Users', () => {
    let createdUserId: string;

    it('GET /users lists users for admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', authHeader('admin'))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /users/:id returns resident', () => {
      return request(app.getHttpServer())
        .get('/users/uid-resident')
        .set('Authorization', authHeader('admin'))
        .expect(200)
        .expect((res) => {
          expect(res.body.profileId).toBe('resident');
        });
    });

    it('POST /users creates resident as admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authHeader('admin'))
        .send({
          name: 'Usuario E2E',
          email: 'e2e-user@test.com',
          password: 'secret123',
          cpf: '999.888.777-66',
          phone: '(61) 91111-2222',
          apartment: '101',
          block: 'A',
          profileId: 'resident',
        })
        .expect(201);

      createdUserId = response.body.uid;
      expect(createdUserId).toBeTruthy();
    });

    it('PUT /users/:id updates user', () => {
      return request(app.getHttpServer())
        .put(`/users/${createdUserId}`)
        .set('Authorization', authHeader('admin'))
        .send({
          name: 'Usuario E2E Atualizado',
          cpf: '999.888.777-66',
          phone: '(61) 93333-4444',
          apartment: '102',
          block: 'A',
          profileId: 'resident',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Usuario E2E Atualizado');
        });
    });

    it('DELETE /users/:id removes created user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', authHeader('admin'))
        .expect(204);
    });

    it('doorman cannot create admin user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', authHeader('doorman'))
        .send({
          name: 'Hacker',
          email: 'hacker@test.com',
          password: 'secret123',
          cpf: '000.000.000-00',
          phone: '(61) 90000-0000',
          profileId: 'admin',
        })
        .expect(403);
    });
  });

  describe('Reservations', () => {
    let reservationId: string;
    let visitorForLinkId: string;

    it('GET /reservations/spaces', () => {
      return request(app.getHttpServer())
        .get('/reservations/spaces')
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(
            res.body.some((s: { name: string }) => s.name === 'Salão de Festas'),
          ).toBe(true);
        });
    });

    it('GET /reservations/available-slots returns schedule blocks', () => {
      return request(app.getHttpServer())
        .get('/reservations/available-slots')
        .query({
          space: 'Quadra Esportiva',
          date: daysFromNow(2).toISOString(),
        })
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('POST /reservations creates a reservation', async () => {
      const response = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', authHeader('resident'))
        .send({
          space: 'Quadra Esportiva',
          date: daysFromNow(2).toISOString(),
          startTime: '15:00',
          endTime: '16:00',
          status: 'confirmed',
          notes: 'Teste e2e',
        })
        .expect(201);

      reservationId = response.text;
      expect(reservationId).toBeTruthy();
    });

    it('GET /reservations lists reservations', () => {
      return request(app.getHttpServer())
        .get('/reservations')
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('GET /reservations/:id returns reservation', () => {
      return request(app.getHttpServer())
        .get(`/reservations/${reservationId}`)
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(reservationId);
        });
    });

    it('PUT /reservations/:id updates reservation', () => {
      return request(app.getHttpServer())
        .put(`/reservations/${reservationId}`)
        .set('Authorization', authHeader('resident'))
        .send({
          space: 'Quadra Esportiva',
          date: daysFromNow(2).toISOString(),
          startTime: '15:00',
          endTime: '16:00',
          status: 'confirmed',
          notes: 'Notas atualizadas e2e',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.notes).toBe('Notas atualizadas e2e');
        });
    });

    it('POST /visitors creates visitor for link test', async () => {
      const response = await request(app.getHttpServer())
        .post('/visitors')
        .set('Authorization', authHeader('resident'))
        .send({
          name: 'Visitante Link E2E',
          cpf: '222.333.444-55',
          phone: '(61) 98888-0000',
          purpose: 'Reserva',
          date: daysFromNow(2).toISOString(),
          time: '15:00',
          visitType: 'reservation',
        })
        .expect(201);

      visitorForLinkId = response.text;
    });

    it('POST /reservations/:id/visitors/:visitorId links visitor', () => {
      return request(app.getHttpServer())
        .post(`/reservations/${reservationId}/visitors/${visitorForLinkId}`)
        .set('Authorization', authHeader('resident'))
        .expect(201);
    });

    it('DELETE /reservations/:id/visitors/:visitorId unlinks visitor', () => {
      return request(app.getHttpServer())
        .delete(`/reservations/${reservationId}/visitors/${visitorForLinkId}`)
        .set('Authorization', authHeader('resident'))
        .expect(204);
    });

    it('DELETE /reservations/:id removes reservation', () => {
      return request(app.getHttpServer())
        .delete(`/reservations/${reservationId}`)
        .set('Authorization', authHeader('resident'))
        .expect(204);
    });
  });

  describe('Visitors', () => {
    let visitorId: string;

    it('POST /visitors creates waiting visitor', async () => {
      const response = await request(app.getHttpServer())
        .post('/visitors')
        .set('Authorization', authHeader('resident'))
        .send({
          name: 'Visitante E2E',
          cpf: '111.222.333-44',
          phone: '(61) 99999-0000',
          purpose: 'Visita teste',
          date: daysFromNow(1).toISOString(),
          time: '14:00',
          visitType: 'apartment',
        })
        .expect(201);

      visitorId = response.text;
    });

    it('GET /visitors/:id returns visitor', () => {
      return request(app.getHttpServer())
        .get(`/visitors/${visitorId}`)
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(visitorId);
        });
    });

    it('PUT /visitors/:id updates visitor', () => {
      return request(app.getHttpServer())
        .put(`/visitors/${visitorId}`)
        .set('Authorization', authHeader('resident'))
        .send({
          name: 'Visitante E2E Atualizado',
          cpf: '111.222.333-44',
          phone: '(61) 99999-0001',
          purpose: 'Visita atualizada',
          date: daysFromNow(1).toISOString(),
          time: '15:00',
          visitType: 'apartment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Visitante E2E Atualizado');
        });
    });

    it('PATCH /visitors/:id/status authorizes visitor as doorman', () => {
      return request(app.getHttpServer())
        .patch(`/visitors/${visitorId}/status`)
        .set('Authorization', authHeader('doorman'))
        .send({ status: 'authorized' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('authorized');
          expect(res.body.createdBy).toBe('uid-resident');
        });
    });

    it('GET /visitors lists authorized visitor', () => {
      return request(app.getHttpServer())
        .get('/visitors')
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          const found = res.body.find((v: { id: string }) => v.id === visitorId);
          expect(found?.status).toBe('authorized');
        });
    });

    it('DELETE /visitors/:id removes visitor', () => {
      return request(app.getHttpServer())
        .delete(`/visitors/${visitorId}`)
        .set('Authorization', authHeader('resident'))
        .expect(204);
    });
  });

  describe('Pre-authorizations', () => {
    let preAuthId: string;

    it('POST /pre-authorizations', async () => {
      const response = await request(app.getHttpServer())
        .post('/pre-authorizations')
        .set('Authorization', authHeader('resident'))
        .send({
          name: 'Diarista E2E',
          cpf: '555.666.777-88',
          schedule: 'Segunda 08:00',
          validUntil: '2026-12-31',
        })
        .expect(201);

      preAuthId = response.text;
    });

    it('GET /pre-authorizations/:id', () => {
      return request(app.getHttpServer())
        .get(`/pre-authorizations/${preAuthId}`)
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(preAuthId);
        });
    });

    it('GET /pre-authorizations lists entries', () => {
      return request(app.getHttpServer())
        .get('/pre-authorizations')
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(res.body.some((p: { id: string }) => p.id === preAuthId)).toBe(
            true,
          );
        });
    });

    it('PUT /pre-authorizations/:id updates entry', () => {
      return request(app.getHttpServer())
        .put(`/pre-authorizations/${preAuthId}`)
        .set('Authorization', authHeader('resident'))
        .send({
          name: 'Diarista E2E Atualizada',
          cpf: '555.666.777-88',
          schedule: 'Terça 09:00',
          validUntil: '2026-12-31',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.schedule).toBe('Terça 09:00');
        });
    });

    it('DELETE /pre-authorizations/:id', () => {
      return request(app.getHttpServer())
        .delete(`/pre-authorizations/${preAuthId}`)
        .set('Authorization', authHeader('resident'))
        .expect(204);
    });
  });

  describe('Announcements', () => {
    let announcementId: string;

    it('POST /announcements creates announcement', async () => {
      const response = await request(app.getHttpServer())
        .post('/announcements')
        .set('Authorization', authHeader('admin'))
        .send({
          title: 'Aviso E2E',
          content: 'Conteudo teste',
          category: 'general',
          isPinned: false,
          isImportant: false,
        })
        .expect(201);

      announcementId = response.text;
    });

    it('GET /announcements/:id returns announcement', () => {
      return request(app.getHttpServer())
        .get(`/announcements/${announcementId}`)
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(announcementId);
        });
    });

    it('GET /announcements lists announcements', () => {
      return request(app.getHttpServer())
        .get('/announcements')
        .set('Authorization', authHeader('resident'))
        .expect(200)
        .expect((res) => {
          expect(
            res.body.some((a: { id: string }) => a.id === announcementId),
          ).toBe(true);
        });
    });

    it('PUT /announcements/:id updates announcement', () => {
      return request(app.getHttpServer())
        .put(`/announcements/${announcementId}`)
        .set('Authorization', authHeader('admin'))
        .send({
          title: 'Aviso E2E Atualizado',
          content: 'Conteudo alterado',
          category: 'important',
          isPinned: true,
          isImportant: true,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('Aviso E2E Atualizado');
        });
    });

    it('DELETE /announcements/:id removes announcement', () => {
      return request(app.getHttpServer())
        .delete(`/announcements/${announcementId}`)
        .set('Authorization', authHeader('admin'))
        .expect(204);
    });
  });

  describe('Reports', () => {
    it('GET /reports/operational', () => {
      return request(app.getHttpServer())
        .get('/reports/operational')
        .set('Authorization', authHeader('admin'))
        .expect(200)
        .expect((res) => {
          expect(res.body.summary).toBeDefined();
          expect(Array.isArray(res.body.reservations)).toBe(true);
          expect(Array.isArray(res.body.visitors)).toBe(true);
        });
    });
  });
});
