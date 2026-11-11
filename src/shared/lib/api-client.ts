export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiClient {
  constructor(private readonly baseUrl = "/api") {}

  get<T>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>("PATCH", path, body);
  }

  upload<T>(path: string, form: FormData): Promise<T> {
    return this.request<T>("PUT", path, form);
  }

  delete(path: string): Promise<void> {
    return this.request<void>("DELETE", path);
  }

  private async request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const isJson = body !== undefined && !(body instanceof FormData);
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: isJson ? { "Content-Type": "application/json" } : undefined,
      body: isJson ? JSON.stringify(body) : (body as FormData | undefined),
    });
    if (!response.ok) throw await this.toError(response);
    return response.status === 204 ? (undefined as T) : response.json();
  }

  private async toError(response: Response): Promise<ApiError> {
    const payload = await response.json().catch(() => ({}));
    return new ApiError(response.status, payload.code ?? "UNKNOWN", payload.message ?? response.statusText);
  }
}

export const apiClient = new ApiClient();
