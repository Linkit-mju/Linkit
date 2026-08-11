import {type CSSProperties, type FormEvent, useState} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ApiError} from '../api/client';
import {joinOrganization, type JoinedOrganization} from './api';

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

function normalizeInviteCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

export function OrganizationJoinPage({
  onJoined,
  onDashboard,
}: {
  onJoined: (organization: JoinedOrganization) => void;
  onDashboard: () => void;
}) {
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApiError>();
  const isComplete = inviteCode.length === 6;
  const isAlreadyJoined = error?.code === 'ORGANIZATION_ALREADY_JOINED';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isComplete || isSubmitting) {
      return;
    }

    setError(undefined);
    setIsSubmitting(true);
    try {
      const organization = await joinOrganization(inviteCode);
      onJoined(organization);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught
          : new ApiError(
              'ORGANIZATION_JOIN_FAILED',
              '조직 가입 중 문제가 발생했습니다.',
              0,
            ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Center axis="both" style={pageStyle}>
      <VStack gap={5} hAlign="center" style={contentStyle}>
        <VStack gap={1} hAlign="center">
          <Text type="display-3" weight="bold" color="accent">
            Linkit
          </Text>
          <Text type="supporting" color="secondary" justify="center">
            학생회의 경험을 다음 임기로 연결하세요
          </Text>
        </VStack>

        <Card padding={8} width="100%" elevation="low">
          <VStack gap={5} hAlign="stretch">
            <VStack gap={1} hAlign="center">
              <Heading level={1}>소속 조직에 가입하기</Heading>
              <Text type="supporting" color="secondary" justify="center">
                관리자에게 전달받은 6자리 초대코드를 입력해주세요.
              </Text>
            </VStack>

            {error ? (
              <VStack gap={3} hAlign="stretch">
                <Banner
                  status={isAlreadyJoined ? 'warning' : 'error'}
                  title={error.message}
                  description={
                    isAlreadyJoined
                      ? '이미 소속된 조직의 대시보드에서 활동을 이어갈 수 있습니다.'
                      : '초대코드를 다시 확인한 뒤 입력해주세요.'
                  }
                />
                {isAlreadyJoined ? (
                  <Button
                    label="대시보드로 이동"
                    variant="secondary"
                    size="lg"
                    width="100%"
                    onClick={onDashboard}
                  />
                ) : null}
              </VStack>
            ) : null}

            <form onSubmit={handleSubmit} noValidate style={formStyle}>
              <VStack gap={4} hAlign="stretch">
                <TextInput
                  label="초대코드"
                  value={inviteCode}
                  onChange={(value) => {
                    setInviteCode(normalizeInviteCode(value));
                    setError(undefined);
                  }}
                  description="영문과 숫자로 구성된 6자리 코드입니다."
                  placeholder="예: LINK01"
                  htmlName="inviteCode"
                  isRequired
                  hasAutoFocus
                  size="lg"
                  status={
                    error?.code === 'INVALID_INVITE_CODE'
                      ? {type: 'error', message: error.message}
                      : undefined
                  }
                />
                <Button
                  label="가입하기"
                  type="submit"
                  variant="primary"
                  size="lg"
                  width="100%"
                  isDisabled={!isComplete}
                  isLoading={isSubmitting}
                />
              </VStack>
            </form>
          </VStack>
        </Card>

        <Text type="supporting" color="secondary" justify="center">
          초대코드는 소속 조직 관리자에게 문의해주세요.
        </Text>
      </VStack>
    </Center>
  );
}
