import { ApiError } from '../../infra/http/apiClient'

/** Maps backend auth errors to user-facing Portuguese messages. */
export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return error.message || 'E-mail ou senha incorretos.'
    }
    if (error.status === 403) {
      return 'Voce nao tem permissao para esta acao.'
    }
    return error.message
  }

  return error instanceof Error
    ? error.message
    : 'Nao foi possivel entrar. Tente novamente.'
}
