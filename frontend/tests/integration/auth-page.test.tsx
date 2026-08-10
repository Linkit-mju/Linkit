import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it} from 'vitest';
import App from '../../src/App';

describe('인증 페이지', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/login');
  });

  it('학교 이메일과 비밀번호 없이 로그인하면 입력 오류를 표시한다', async () => {
    // Given: a visitor is on the login page
    const user = userEvent.setup();
    render(<App />);

    // When: the visitor submits an empty form
    await user.click(screen.getByRole('button', {name: '로그인'}));

    // Then: the required-field feedback is visible
    expect(await screen.findByText('입력 내용을 확인해주세요.')).toBeVisible();
    expect(
      screen.getByText('명지대학교 이메일(@mju.ac.kr)을 입력해주세요.'),
    ).toBeVisible();
    expect(screen.getByText('비밀번호를 입력해주세요.')).toBeVisible();
  });
});
