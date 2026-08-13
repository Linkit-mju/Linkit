import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import App from '../../src/App';

const fetchMock = vi.fn<typeof fetch>();

vi.mock('../../src/handover/HandoverPage', () => ({
  HandoverPage: () => '인수인계 화면',
}));

describe('인증 페이지', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/login');
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(
      new Response(undefined, {status: 401, statusText: 'Unauthorized'}),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  it('학교 이메일과 비밀번호 없이 로그인하면 입력 오류를 표시한다', async () => {
    // Given: a visitor is on the login page
    const user = userEvent.setup();
    render(<App />);

    // When: the visitor submits an empty form
    await user.click(await screen.findByRole('button', {name: '로그인'}));

    // Then: the required-field feedback is visible
    expect(await screen.findByText('입력 내용을 확인해주세요.')).toBeVisible();
    expect(
      screen.getByText('명지대학교 이메일(@mju.ac.kr)을 입력해주세요.'),
    ).toBeVisible();
    expect(screen.getAllByText('비밀번호를 입력해주세요.')[0])
      .toBeVisible();
  });

  it('인증되지 않은 사용자가 보호 경로를 열면 로그인으로 이동한다', async () => {
    // Given: an unauthenticated visitor requests the protected root route
    window.history.replaceState({}, '', '/');

    // When: the application checks the current session
    render(<App />);

    // Then: the login page replaces the protected route
    expect(await screen.findByRole('heading', {name: '로그인'})).toBeVisible();
    expect(window.location.pathname).toBe('/login');
  });

  it('인증된 사용자가 인증 경로를 열면 인수인계로 이동한다', async () => {
    // Given: an authenticated visitor requests the login route
    fetchMock.mockResolvedValue(
      Response.json({
        id: '00000000-0000-4000-8000-000000000001',
        email: 'student@mju.ac.kr',
        name: '홍길동',
      }),
    );

    // When: the application checks the current session
    render(<App />);

    // Then: the handover page replaces the authentication route
    expect(await screen.findByText('인수인계 화면')).toBeVisible();
    expect(window.location.pathname).toBe('/');
  });
});
