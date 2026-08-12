import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ApiError} from '../api';
import {login, signUp} from './api';
import {
  isMjuEmail,
  MJU_EMAIL_DOMAIN,
  normalizeEmail,
  validatePassword,
} from './validation';

type AuthRoute = 'login' | 'signup';
type FieldStatus = {
  type: 'error' | 'warning' | 'success';
  message?: string;
};

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-background-body)',
  padding: 'var(--spacing-6)',
};

const contentStyle: CSSProperties = {
  width: '100%',
  maxWidth: '28rem',
};

const formStyle: CSSProperties = {
  width: '100%',
};

function routeFromPathname(pathname: string): AuthRoute {
  return pathname === '/signup' ? 'signup' : 'login';
}

function navigate(route: AuthRoute) {
  const path = route === 'signup' ? '/signup' : '/login';
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Brand() {
  return (
    <VStack gap={1} hAlign="center">
      <Text type="display-3" weight="bold" color="accent">
        Linkit
      </Text>
      <Text type="supporting" color="secondary" justify="center">
        학생회의 경험을 다음 임기로 연결하세요
      </Text>
    </VStack>
  );
}

function LoginForm({
  onNavigate,
  onLoginSuccess,
  onVerificationRequired,
}: {
  onNavigate: () => void;
  onLoginSuccess: () => void;
  onVerificationRequired: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [message, setMessage] = useState<
    {status: 'error' | 'success'; title: string; description?: string} | undefined
  >();

  const emailStatus: FieldStatus | undefined =
    hasSubmitted && !isMjuEmail(email)
      ? {
          type: 'error',
          message: `명지대학교 이메일(${MJU_EMAIL_DOMAIN})을 입력해주세요.`,
        }
      : undefined;

  const passwordStatus: FieldStatus | undefined =
    hasSubmitted && !password
      ? {type: 'error', message: '비밀번호를 입력해주세요.'}
      : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    setMessage(undefined);

    if (!isMjuEmail(email) || !password) {
      setMessage({
        status: 'error',
        title: '입력 내용을 확인해주세요.',
        description: '표시된 항목을 수정한 뒤 다시 시도해주세요.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({
        email: normalizeEmail(email),
        password,
      });
      window.location.replace('/');
      setMessage({
        status: 'success',
        title: `${user.name}님, 환영합니다.`,
        description: '소속 조직을 확인하는 화면으로 이동합니다.',
      });
      onLoginSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_NOT_VERIFIED') {
        onVerificationRequired(normalizeEmail(email));
        return;
      }
      setMessage({
        status: 'error',
        title:
          error instanceof ApiError
            ? error.message
            : '로그인 중 문제가 발생했습니다.',
        description: '입력 내용을 확인하거나 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VStack gap={5} hAlign="stretch">
      <VStack gap={1} hAlign="center">
        <Heading level={1}>로그인</Heading>
        <Text type="supporting" color="secondary" justify="center">
          학교 이메일로 학생회 인수인계를 이어가세요.
        </Text>
      </VStack>

      {message ? (
        <Banner
          status={message.status}
          title={message.title}
          description={message.description}
        />
      ) : null}

      <form onSubmit={handleSubmit} noValidate style={formStyle}>
        <VStack gap={4} hAlign="stretch">
          <FormLayout>
            <TextInput
              label="학교 이메일"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setMessage(undefined);
              }}
              placeholder={`name${MJU_EMAIL_DOMAIN}`}
              type="email"
              htmlName="email"
              isRequired
              size="lg"
              status={emailStatus}
            />
            <TextInput
              label="비밀번호"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setMessage(undefined);
              }}
              placeholder="비밀번호 입력"
              type="password"
              htmlName="password"
              isRequired
              size="lg"
              status={passwordStatus}
            />
          </FormLayout>

          <Button
            label="로그인"
            type="submit"
            variant="primary"
            size="lg"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>

      <HStack gap={1} hAlign="center" vAlign="center">
        <Text type="supporting" color="secondary">
          아직 계정이 없나요?
        </Text>
        <Link
          href="/signup"
          isStandalone
          onClick={(event) => {
            event.preventDefault();
            onNavigate();
          }}
        >
          회원가입
        </Link>
      </HStack>
    </VStack>
  );
}

function SignupForm({
  onNavigate,
  onSignUpSuccess,
}: {
  onNavigate: () => void;
  onSignUpSuccess: (email: string) => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<
    {status: 'error' | 'success'; title: string; description?: string} | undefined
  >();

  const passwordError = validatePassword(password);
  const emailStatus: FieldStatus | undefined =
    hasSubmitted && !isMjuEmail(email)
      ? {
          type: 'error',
          message: `가입은 ${MJU_EMAIL_DOMAIN} 이메일만 가능합니다.`,
        }
      : email && isMjuEmail(email)
        ? {type: 'success', message: '사용 가능한 학교 이메일입니다.'}
        : undefined;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    setMessage(undefined);

    const isInvalid =
      !name.trim() ||
      !isMjuEmail(email) ||
      Boolean(passwordError) ||
      password !== passwordConfirm ||
      !hasAcceptedTerms;

    if (isInvalid) {
      setMessage({
        status: 'error',
        title: '가입 정보를 확인해주세요.',
        description: '표시된 필수 항목을 모두 올바르게 입력해주세요.',
      });
      return;
    }

    const normalizedEmail = normalizeEmail(email);
    setEmail(normalizedEmail);
    setIsSubmitting(true);
    try {
      const user = await signUp({
        name: name.trim(),
        email: normalizedEmail,
        password,
        termsAccepted: hasAcceptedTerms,
      });
      onSignUpSuccess(user.email);
    } catch (error) {
      setMessage({
        status: 'error',
        title:
          error instanceof ApiError
            ? error.message
            : '회원가입 중 문제가 발생했습니다.',
        description: '입력 내용을 확인하거나 잠시 후 다시 시도해주세요.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <VStack gap={5} hAlign="stretch">
      <VStack gap={1} hAlign="center">
        <Heading level={1}>회원가입</Heading>
        <Text type="supporting" color="secondary" justify="center">
          명지대학교 이메일 인증 후 Linkit을 시작할 수 있어요.
        </Text>
      </VStack>

      <Banner
        status="info"
        title={`${MJU_EMAIL_DOMAIN} 이메일만 가입할 수 있습니다.`}
        description="계정 생성 후 관리자가 전달한 초대코드로 소속 조직에 가입합니다."
      />

      {message ? (
        <Banner
          status={message.status}
          title={message.title}
          description={message.description}
        />
      ) : null}

      <form onSubmit={handleSubmit} noValidate style={formStyle}>
        <VStack gap={4} hAlign="stretch">
          <FormLayout>
            <TextInput
              label="이름"
              value={name}
              onChange={(value) => {
                setName(value);
                setMessage(undefined);
              }}
              placeholder="홍길동"
              htmlName="name"
              isRequired
              size="lg"
              status={
                hasSubmitted && !name.trim()
                  ? {type: 'error', message: '이름을 입력해주세요.'}
                  : undefined
              }
            />
            <TextInput
              label="학교 이메일"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setMessage(undefined);
              }}
              description="이 주소로 이메일 인증 링크를 보내드립니다."
              placeholder={`name${MJU_EMAIL_DOMAIN}`}
              type="email"
              htmlName="email"
              isRequired
              size="lg"
              status={emailStatus}
            />
            <TextInput
              label="비밀번호"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setMessage(undefined);
              }}
              description="영문과 숫자를 포함해 8자 이상 입력해주세요."
              placeholder="비밀번호 입력"
              type="password"
              htmlName="password"
              isRequired
              size="lg"
              status={
                hasSubmitted && passwordError
                  ? {type: 'error', message: passwordError}
                  : undefined
              }
            />
            <TextInput
              label="비밀번호 확인"
              value={passwordConfirm}
              onChange={(value) => {
                setPasswordConfirm(value);
                setMessage(undefined);
              }}
              placeholder="비밀번호 다시 입력"
              type="password"
              htmlName="passwordConfirm"
              isRequired
              size="lg"
              status={
                hasSubmitted && password !== passwordConfirm
                  ? {
                      type: 'error',
                      message: '입력한 비밀번호가 서로 다릅니다.',
                    }
                  : undefined
              }
            />
          </FormLayout>

          <CheckboxInput
            label="이용약관과 개인정보 처리방침에 동의합니다."
            value={hasAcceptedTerms}
            onChange={(checked) => {
              setHasAcceptedTerms(checked);
              setMessage(undefined);
            }}
            htmlName="terms"
            isRequired
            status={
              hasSubmitted && !hasAcceptedTerms
                ? {type: 'error', message: '가입하려면 필수 약관에 동의해주세요.'}
                : undefined
            }
          />

          <Button
            label="인증 메일 받고 가입하기"
            type="submit"
            variant="primary"
            size="lg"
            width="100%"
            isLoading={isSubmitting}
          />
        </VStack>
      </form>

      <HStack gap={1} hAlign="center" vAlign="center">
        <Text type="supporting" color="secondary">
          이미 계정이 있나요?
        </Text>
        <Link
          href="/login"
          isStandalone
          onClick={(event) => {
            event.preventDefault();
            onNavigate();
          }}
        >
          로그인
        </Link>
      </HStack>
    </VStack>
  );
}

export function AuthPage({
  onLoginSuccess,
  onSignUpSuccess,
  onVerificationRequired,
}: {
  onLoginSuccess: () => void;
  onSignUpSuccess: (email: string) => void;
  onVerificationRequired: (email: string) => void;
}) {
  const [route, setRoute] = useState<AuthRoute>(() =>
    routeFromPathname(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () =>
      setRoute(routeFromPathname(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goTo = (nextRoute: AuthRoute) => {
    navigate(nextRoute);
    setRoute(nextRoute);
  };

  return (
    <Center axis="both" style={pageStyle}>
      <VStack gap={5} hAlign="center" style={contentStyle}>
        <Brand />
        <Card padding={8} width="100%" elevation="low">
          {route === 'signup' ? (
            <SignupForm
              onNavigate={() => goTo('login')}
              onSignUpSuccess={onSignUpSuccess}
            />
          ) : (
            <LoginForm
              onNavigate={() => goTo('signup')}
              onLoginSuccess={onLoginSuccess}
              onVerificationRequired={onVerificationRequired}
            />
          )}
        </Card>
        <Text type="supporting" color="secondary" justify="center">
          명지대학교 학생회를 위한 안전한 인수인계 공간
        </Text>
      </VStack>
    </Center>
  );
}
