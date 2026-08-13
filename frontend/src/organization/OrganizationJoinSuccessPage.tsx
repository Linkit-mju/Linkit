import {type CSSProperties, useEffect} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import type {JoinedOrganization} from './api';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-background-body)',
  padding: 'var(--spacing-6)',
};

const contentStyle: CSSProperties = {
  width: '100%',
  maxWidth: '28rem',
};

export function OrganizationJoinSuccessPage({
  organization,
  onContinue,
}: {
  organization?: JoinedOrganization;
  onContinue: () => void;
}) {
  useEffect(() => {
    const redirect = window.setTimeout(onContinue, 1800);
    return () => window.clearTimeout(redirect);
  }, [onContinue]);

  return (
    <Center axis="both" style={pageStyle}>
      <VStack gap={5} hAlign="center" style={contentStyle}>
        <Text type="display-3" weight="bold" color="accent">
          Linkit
        </Text>
        <Card padding={8} width="100%" elevation="low">
          <VStack gap={4} hAlign="stretch">
            <Heading level={1}>조직 가입 완료</Heading>
            <Banner
              status="success"
              title={`${organization?.name ?? '조직'}에 가입되었습니다.`}
              description="잠시 후 인수인계 페이지로 이동합니다."
            />
            <Text color="secondary">
              이제 소속 조직의 인수인계 자료와 조직도를 확인할 수 있습니다.
            </Text>
            <Button label="인수인계 페이지로 이동" variant="primary" width="100%" onClick={onContinue}/>
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}
