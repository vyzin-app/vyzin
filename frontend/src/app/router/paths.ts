/** Central route paths (Next.js-style segments). */
export const paths = {
  login: '/login',
  dashboard: '/dashboard',
  reservations: '/reservations',
  mural: '/mural',
  visitantes: '/visitantes',
  informacoes: '/informacoes',
  relatorio: '/relatorio',
  seguranca: {
    root: '/seguranca',
    usuarios: '/seguranca/usuarios',
    perfis: '/seguranca/perfis',
  },
} as const

export type AppPath =
  | typeof paths.dashboard
  | typeof paths.reservations
  | typeof paths.mural
  | typeof paths.visitantes
  | typeof paths.informacoes
  | typeof paths.relatorio
  | typeof paths.seguranca.usuarios
  | typeof paths.seguranca.perfis
