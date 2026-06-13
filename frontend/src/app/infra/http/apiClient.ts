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
 * Factory that builds an HTTP client which injects the Firebase ID token as a
 * Bearer header, parses JSON, and normalizes errors. Decouples the data layer
 * from fetch and from how the token is obtained (Dependency Inversion).
 */
export function createApiClient({
  baseUrl,
  getToken,
  onUnauthorized,
}: ApiClientOptions): ApiClient {
  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const token = await getToken()
    const headers: Record<string, string> = {}
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json'
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (response.status === 401) {
      onUnauthorized?.()
    }

    if (!response.ok) {
      throw new ApiError(response.status, await extractErrorMessage(response))
    }

    if (response.status === 204) {
      return undefined as T
    }

    const text = await response.text()
    return (text ? JSON.parse(text) : undefined) as T
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    del: (path) => request<void>('DELETE', path),
  }
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json()
    const message = (data as { message?: string | string[] }).message
    if (Array.isArray(message)) {
      return message.join(', ')
    }
    return message ?? response.statusText
  } catch {
    return response.statusText
  }
}
