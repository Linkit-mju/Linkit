import {z} from 'zod';
import {requestJson} from '../api';

const AuthUserSchema = z
  .object({
    id: z.string().uuid(),
    email: z.string(),
    name: z.string(),
  })
  .readonly();

export type AuthUser = z.infer<typeof AuthUserSchema>;

type CsrfResponse = {
  headerName: string;
  token: string;
};

type ApiErrorBody = {
  code?: string;
  message?: string;
};

export class AuthApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'AuthApiError';
    this.code = code;
    this.status = status;
  }
}

async function getCsrfToken(): Promise<CsrfResponse> {
  const response = await fetch('/api/v1/auth/csrf', {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new AuthApiError(
      'CSRF_TOKEN_FAILED',
      '보안 토큰을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
      response.status,
    );
  }

  return response.json() as Promise<CsrfResponse>;
}

async function post<TResponse>(
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
    throw new AuthApiError(
      error.code ?? 'AUTH_REQUEST_FAILED',
      error.message ?? '요청을 처리하지 못했습니다.',
      response.status,
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export function signUp(input: {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}): Promise<AuthUser> {
  return post<AuthUser>('/api/v1/auth/sign-up', input);
}

export function login(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  return post<AuthUser>('/api/v1/auth/login', input);
}

export function getCurrentUser(): Promise<AuthUser> {
  return requestJson('/api/v1/auth/me', AuthUserSchema);
}
