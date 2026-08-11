type CsrfResponse = {
  headerName: string;
  token: string;
};

type ApiErrorBody = {
  code?: string;
  message?: string;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function getCsrfToken(): Promise<CsrfResponse> {
  const response = await fetch('/api/v1/auth/csrf', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new ApiError(
      'CSRF_TOKEN_FAILED',
      '보안 토큰을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      response.status,
    );
  }

  return response.json() as Promise<CsrfResponse>;
}

export async function postJson<TResponse>(
  path: string,
  body?: Record<string, unknown>,
): Promise<TResponse> {
  const csrf = await getCsrfToken();
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(
      error.code ?? 'API_REQUEST_FAILED',
      error.message ?? '요청을 처리하지 못했습니다.',
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
