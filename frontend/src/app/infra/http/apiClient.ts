import axios, { AxiosError, type AxiosInstance } from 'axios'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export interface ApiClient {
  get<T>(path: string): Promise<T>
  post<T>(path: string, body?: unknown): Promise<T>
  put<T>(path: string, body?: unknown): Promise<T>
  patch<T>(path: string, body?: unknown): Promise<T>
  del(path: string): Promise<void>
}

interface ApiClientOptions {
  baseUrl: string
  getToken: () => Promise<string | null>
  onUnauthorized?: () => void
}

/**
 * Factory that builds an HTTP client (Axios) which injects the Firebase ID token
 * as a Bearer header and normalizes errors. Decouples the data layer from the
 * transport and from how the token is obtained (Dependency Inversion).
 */
export function createApiClient({
  baseUrl,
  getToken,
  onUnauthorized,
}: ApiClientOptions): ApiClient {
  const http: AxiosInstance = axios.create({
    baseURL: baseUrl,
  })

  http.interceptors.request.use(async (config) => {
    const token = await getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  http.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status ?? 0

      if (status === 401) {
        onUnauthorized?.()
      }

      return Promise.reject(
        new ApiError(status, extractErrorMessage(error)),
      )
    },
  )

  async function request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await http.request<T>({
      method,
      url: path,
      data: body,
    })

    return response.data
  }

  return {
    get: (path) => request('get', path),
    post: (path, body) => request('post', path, body),
    put: (path, body) => request('put', path, body),
    patch: (path, body) => request('patch', path, body),
    del: (path) => request<void>('delete', path),
  }
}

function extractErrorMessage(error: AxiosError): string {
  const data = error.response?.data

  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: string | string[] }).message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    if (typeof message === 'string') {
      return message
    }
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  return error.message || 'Erro na requisição'
}
