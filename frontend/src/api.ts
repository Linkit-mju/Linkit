import {z} from 'zod';

const CsrfSchema = z.object({
  headerName: z.string(),
  token: z.string(),
});

const ApiErrorBodySchema = z.object({
  code: z.string().optional(),
  message: z.string().optional(),
});

type RequestOptions = Omit<RequestInit, 'body'> & {
  readonly json?: unknown;
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

async function throwResponseError(response: Response): Promise<never> {
  const value: unknown = await response.json().catch(() => undefined);
  const body = ApiErrorBodySchema.safeParse(value);
  throw new ApiError(
    body.success ? (body.data.code ?? 'API_REQUEST_FAILED') : 'API_REQUEST_FAILED',
    body.success
      ? (body.data.message ?? '요청을 처리하지 못했습니다.')
      : '요청을 처리하지 못했습니다.',
    response.status,
  );
}

async function csrfHeaders(): Promise<Headers> {
  const response = await fetch('/api/v1/auth/csrf', {credentials: 'include'});
  if (!response.ok) return throwResponseError(response);

  const csrf = CsrfSchema.parse(await response.json());
  return new Headers({[csrf.headerName]: csrf.token});
}

async function request(path: string, options: RequestOptions): Promise<Response> {
  const method = options.method?.toString().toUpperCase() ?? 'GET';
  const headers = method === 'GET' || method === 'HEAD'
    ? new Headers(options.headers)
    : await csrfHeaders();
  const {json, ...init} = options;
  if (json !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(path, {
    ...init,
    body: json === undefined ? undefined : JSON.stringify(json),
    credentials: 'include',
    headers,
  });
  if (!response.ok) return throwResponseError(response);
  return response;
}

export async function requestJson<T>(
  path: string,
  schema: z.ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  return schema.parse(await (await request(path, options)).json());
}

export async function requestVoid(
  path: string,
  options: RequestOptions,
): Promise<void> {
  await request(path, options);
}
