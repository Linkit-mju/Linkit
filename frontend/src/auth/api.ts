


import {postJson} from '../api/client';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

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
