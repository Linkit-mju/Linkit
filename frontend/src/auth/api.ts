import {z} from 'zod';
import {requestJson, requestVoid} from '../api';

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
  return requestJson('/api/v1/auth/sign-up', AuthUserSchema, {method: 'POST', json: input});
}

export function login(input: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  return requestJson('/api/v1/auth/login', AuthUserSchema, {method: 'POST', json: input});
}

export function confirmEmail(token: string): Promise<AuthUser> {
  return requestJson('/api/v1/auth/email-verifications/confirm', AuthUserSchema, {method: 'POST', json: {token}});
}

export function resendEmailVerification(email: string): Promise<void> {
  return requestVoid('/api/v1/auth/email-verifications/resend', {method: 'POST', json: {email}});
}

export function getCurrentUser(): Promise<AuthUser> {
  return requestJson('/api/v1/auth/me', AuthUserSchema);
}
