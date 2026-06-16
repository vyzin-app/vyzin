import type { CondoInformation } from '../entities/condo-information.entity';

/** Default condominium information seeded on first run. */
export const DEFAULT_CONDO_INFORMATION: Omit<CondoInformation, 'id'> = {
  contacts: [
    {
      id: 'c1',
      category: 'Administração',
      name: 'Administradora Silva & Santos',
      phone: '(61) 3456-7890',
      email: 'contato@silvaesantos.com.br',
      hours: 'Seg-Sex: 9h às 18h',
    },
    {
      id: 'c2',
      category: 'Administração',
      name: 'Síndico - João Santos',
      phone: '(61) 98765-4321',
      email: 'sindico@condominio.com',
      hours: 'Plantão: Terça 19h-21h',
    },
    {
      id: 'c3',
      category: 'Emergências',
      name: 'Portaria 24h',
      phone: '(61) 3456-7891',
      email: 'portaria@condominio.com',
      hours: '24 horas',
    },
    {
      id: 'c4',
      category: 'Emergências',
      name: 'Bombeiros',
      phone: '193',
      email: '-',
      hours: '24 horas',
    },
    {
      id: 'c5',
      category: 'Manutenção',
      name: 'Zelador - Carlos',
      phone: '(61) 98888-7777',
      email: 'manutencao@condominio.com',
      hours: 'Seg-Sáb: 8h às 17h',
    },
  ],
  rules: [
    {
      id: 'r1',
      category: 'Horários',
      icon: 'Clock',
      items: [
        'Silêncio obrigatório das 22h às 8h',
        'Mudanças permitidas apenas das 8h às 17h',
        'Uso da piscina: 6h às 22h',
      ],
    },
    {
      id: 'r2',
      category: 'Áreas Comuns',
      icon: 'Building2',
      items: [
        'Reserva de churrasqueiras com 48h de antecedência',
        'Salão de festas: máximo 80 pessoas',
        'Pets devem circular com guia e focinheira',
      ],
    },
    {
      id: 'r3',
      category: 'Segurança',
      icon: 'Shield',
      items: [
        'Visitantes devem ser cadastrados pelo morador',
        'Acesso às garagens apenas com controle',
        'Câmeras de segurança 24h em operação',
      ],
    },
  ],
  documents: [
    {
      id: 'd1',
      name: 'Regimento Interno',
      description: 'Normas e regulamentos do condomínio',
      size: '2.3 MB',
      updated: 'Janeiro 2026',
    },
    {
      id: 'd2',
      name: 'Convenção do Condomínio',
      description: 'Documento de constituição e normas gerais',
      size: '1.8 MB',
      updated: 'Dezembro 2025',
    },
  ],
  address: {
    name: 'Residencial Vyzin',
    street: 'Rua das Flores',
    number: '1234',
    neighborhood: 'Jardim Primavera',
    city: 'Brasília',
    state: 'DF',
    zipCode: '01234-567',
  },
  notice:
    'O descumprimento das regras do condomínio está sujeito a multas conforme previsto na convenção.',
};
