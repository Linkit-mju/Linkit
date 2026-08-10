import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import App from '../../src/App';

describe('랜딩 페이지', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('서비스 가치와 시작 경로를 안내한다', () => {
    // Given: a visitor opens the public root route
    render(<App />);

    // When: the landing page is rendered
    const heading = screen.getByRole('heading', {
      name: '학생회의 경험을 다음 임기로 연결하세요',
    });

    // Then: the product promise and primary navigation are visible
    expect(heading).toBeVisible();
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
