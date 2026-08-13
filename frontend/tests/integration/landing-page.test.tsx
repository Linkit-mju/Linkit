import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import App from '../../src/App';

vi.mock('../../src/auth/api', () => ({
  getCurrentUser: vi.fn().mockRejectedValue(new Error('anonymous')),
}));

describe('랜딩 페이지', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('서비스 가치와 시작 경로를 안내한다', async () => {
    render(<App />);

    expect(await screen.findByRole('heading', {
      name: '학생회의 경험을 다음 임기로 연결하세요',
    })).toBeVisible();
    expect(screen.getByRole('link', {name: 'Linkit 시작하기'})).toHaveAttribute(
      'href',
      '/signup',
    );
    expect(screen.getByRole('link', {name: '워크스페이스 미리보기'})).toHaveAttribute(
      'href',
      '/workspace',
    );
  });
});
