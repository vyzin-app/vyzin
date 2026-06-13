/**
 * Catalog of application functions. Each function maps to a protected
 * capability (usually one endpoint). Profiles are assigned a subset of these,
 * which is what the FunctionGuard checks against. This catalog is the single
 * source of truth and is exposed to the frontend via `GET /functions`.
 */
export enum AppFunction {
  RESERVATIONS_READ = 'reservations:read',
  RESERVATIONS_MANAGE = 'reservations:manage',
  RESERVATIONS_MANAGE_ALL = 'reservations:manage_all',
  VISITORS_READ = 'visitors:read',
  VISITORS_MANAGE = 'visitors:manage',
  VISITORS_WORKFLOW = 'visitors:workflow',
  ANNOUNCEMENTS_READ = 'announcements:read',
  ANNOUNCEMENTS_MANAGE = 'announcements:manage',
  INFORMATION_READ = 'information:read',
  INFORMATION_EDIT = 'information:edit',
  USERS_READ = 'users:read',
  USERS_MANAGE = 'users:manage',
  PROFILES_READ = 'profiles:read',
  PROFILES_MANAGE = 'profiles:manage',
}

export interface FunctionDescriptor {
  key: AppFunction;
  label: string;
  area: string;
}

/** Human-readable metadata used by the profile-management screen. */
export const APP_FUNCTION_CATALOG: FunctionDescriptor[] = [
  {
    key: AppFunction.RESERVATIONS_READ,
    label: 'Visualizar reservas',
    area: 'Reservas',
  },
  {
    key: AppFunction.RESERVATIONS_MANAGE,
    label: 'Gerenciar as proprias reservas',
    area: 'Reservas',
  },
  {
    key: AppFunction.RESERVATIONS_MANAGE_ALL,
    label: 'Gerenciar reservas de qualquer usuario',
    area: 'Reservas',
  },
  {
    key: AppFunction.VISITORS_READ,
    label: 'Visualizar visitantes',
    area: 'Visitantes',
  },
  {
    key: AppFunction.VISITORS_MANAGE,
    label: 'Cadastrar e editar visitantes',
    area: 'Visitantes',
  },
  {
    key: AppFunction.VISITORS_WORKFLOW,
    label: 'Autorizar, negar e registrar saida',
    area: 'Visitantes',
  },
  {
    key: AppFunction.ANNOUNCEMENTS_READ,
    label: 'Visualizar avisos',
    area: 'Mural',
  },
  {
    key: AppFunction.ANNOUNCEMENTS_MANAGE,
    label: 'Publicar e editar avisos',
    area: 'Mural',
  },
  {
    key: AppFunction.INFORMATION_READ,
    label: 'Visualizar informacoes',
    area: 'Informacoes',
  },
  {
    key: AppFunction.INFORMATION_EDIT,
    label: 'Editar informacoes',
    area: 'Informacoes',
  },
  { key: AppFunction.USERS_READ, label: 'Visualizar usuarios', area: 'Usuarios' },
  {
    key: AppFunction.USERS_MANAGE,
    label: 'Criar, editar e remover usuarios',
    area: 'Usuarios',
  },
  {
    key: AppFunction.PROFILES_READ,
    label: 'Visualizar perfis',
    area: 'Perfis',
  },
  {
    key: AppFunction.PROFILES_MANAGE,
    label: 'Criar, editar e remover perfis',
    area: 'Perfis',
  },
];

export const ALL_FUNCTIONS: AppFunction[] = APP_FUNCTION_CATALOG.map(
  (descriptor) => descriptor.key,
);
