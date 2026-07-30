export const MJU_EMAIL_DOMAIN = '@mju.ac.kr';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isMjuEmail(email: string): boolean {
  return /^[^\s@]+@mju\.ac\.kr$/i.test(email.trim());
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return '영문과 숫자를 각각 하나 이상 포함해주세요.';
  }

  return undefined;
}
