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

export function signUp(input: {
  name: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}): Promise<AuthUser> {
  return postJson<AuthUser>('/api/v1/auth/sign-up', input);
}

export function login(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  return postJson<AuthUser>('/api/v1/auth/login', input);
}

export function confirmEmail(token: string): Promise<AuthUser> {
  return postJson<AuthUser>('/api/v1/auth/email-verifications/confirm', {token});
}

export function resendEmailVerification(email: string): Promise<void> {
  return postJson<void>('/api/v1/auth/email-verifications/resend', {email});
}

export function getCurrentUser(): Promise<AuthUser> {
  return requestJson('/api/v1/auth/me', AuthUserSchema);
}
