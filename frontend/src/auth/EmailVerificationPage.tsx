import {type CSSProperties, useEffect, useRef, useState} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Heading, Text} from '@astryxdesign/core/Text';
import {ApiError} from '../api';
import {confirmEmail, resendEmailVerification} from './api';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-background-body)',
  padding: 'var(--spacing-6)',
};

const contentStyle: CSSProperties = {width: '100%', maxWidth: '28rem'};

type VerificationState = 'loading' | 'success' | 'error';

function LoginLink({onLogin}: {onLogin: () => void}) {
  return (
    <Link
      href="/login"
      isStandalone
      onClick={(event) => {
        event.preventDefault();
        onLogin();
      }}
    >
      로그인으로 돌아가기
    </Link>
  );
}

export function EmailVerificationPendingPage({
  email,
  onLogin,
}: {
  email: string;
  onLogin: () => void;
}) {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<
    {status: 'success' | 'error'; title: string; description?: string} | undefined
  >();

  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    setMessage(undefined);
    try {
      await resendEmailVerification(email);
      setMessage({
        status: 'success',
        title: '인증 메일을 다시 보냈습니다.',
        description: '가장 최근에 받은 메일의 링크로 인증해주세요.',
      });
    } catch {
      setMessage({
        status: 'error',
        title: '메일을 다시 보내지 못했습니다.',
        description: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <Center axis="both" style={pageStyle}>
      <VStack gap={5} hAlign="center" style={contentStyle}>
        <Text type="display-3" weight="bold" color="accent">Linkit</Text>
        <Card padding={8} width="100%" elevation="low">
          <VStack gap={5} hAlign="stretch">
            <VStack gap={1} hAlign="center">
              <Heading level={1}>인증 메일을 확인해주세요</Heading>
              <Text type="supporting" color="secondary" justify="center">
                메일 속 인증 링크는 30분 동안 사용할 수 있습니다.
              </Text>
            </VStack>
            <Banner
              status="info"
              title={email || '가입한 학교 이메일로 메일을 보냈습니다.'}
              description="메일이 보이지 않으면 스팸함을 확인해주세요."
            />
            {message ? <Banner {...message} /> : null}
            <Button
              label="인증 메일 다시 보내기"
              variant="secondary"
              size="lg"
              width="100%"
              isDisabled={!email}
              isLoading={isResending}
              onClick={handleResend}
            />
            <Center axis="horizontal"><LoginLink onLogin={onLogin} /></Center>
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}

export function EmailVerificationConfirmPage({
  token,
  onLogin,
}: {
  token: string;
  onLogin: () => void;
}) {
  const [state, setState] = useState<VerificationState>(
    token ? 'loading' : 'error',
  );
  const [errorMessage, setErrorMessage] = useState(
    token ? '' : '인증 링크에 필요한 정보가 없습니다.',
  );
  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (hasConfirmed.current) return;
    hasConfirmed.current = true;
    if (!token) return;
    confirmEmail(token)
      .then(() => setState('success'))
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : '이메일을 인증하지 못했습니다.',
        );
        setState('error');
      });
  }, [token]);

  return (
    <Center axis="both" style={pageStyle}>
      <VStack gap={5} hAlign="center" style={contentStyle}>
        <Text type="display-3" weight="bold" color="accent">Linkit</Text>
        <Card padding={8} width="100%" elevation="low">
          <VStack gap={5} hAlign="stretch">
            {state === 'loading' ? (
              <Center axis="both"><Spinner size="lg" label="이메일을 인증하고 있습니다" /></Center>
            ) : state === 'success' ? (
              <>
                <VStack gap={1} hAlign="center">
                  <Heading level={1}>이메일 인증 완료</Heading>
                  <Text type="supporting" color="secondary" justify="center">
                    이제 Linkit에 로그인할 수 있습니다.
                  </Text>
                </VStack>
                <Banner status="success" title="학교 이메일이 확인되었습니다." />
                <Button label="로그인하기" variant="primary" size="lg" width="100%" onClick={onLogin} />
              </>
            ) : (
              <>
                <VStack gap={1} hAlign="center">
                  <Heading level={1}>인증 링크를 확인해주세요</Heading>
                  <Text type="supporting" color="secondary" justify="center">
                    링크가 만료되었거나 이미 사용되었을 수 있습니다.
                  </Text>
                </VStack>
                <Banner status="error" title={errorMessage} description="로그인 화면에서 인증 메일을 다시 받을 수 있습니다." />
                <Center axis="horizontal"><LoginLink onLogin={onLogin} /></Center>
              </>
            )}
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}
