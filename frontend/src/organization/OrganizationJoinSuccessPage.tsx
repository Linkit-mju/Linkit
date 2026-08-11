import {type CSSProperties} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
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
}: {
  organization?: JoinedOrganization;
}) {
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
              description="가입 이후 화면은 다음 구현 단계에서 연결됩니다."
            />
            <Text color="secondary">
              소속 조직의 자료 접근 범위는 관리자 설정에 따라 결정됩니다.
            </Text>
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}
