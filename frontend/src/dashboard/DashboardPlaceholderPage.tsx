import {type CSSProperties} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-background-body)',
  padding: 'var(--spacing-6)',
};

const contentStyle: CSSProperties = {
  width: '100%',
  maxWidth: '28rem',
};

export function DashboardPlaceholderPage() {
  return (
    <Center axis="both" style={pageStyle}>
      <VStack gap={5} hAlign="center" style={contentStyle}>
        <Text type="display-3" weight="bold" color="accent">
          Linkit
        </Text>
        <Card padding={8} width="100%" elevation="low">
          <VStack gap={4} hAlign="stretch">
            <Heading level={1}>대시보드</Heading>
            <Banner
              status="info"
              title="이미 소속 조직에 가입되어 있습니다."
              description="대시보드 콘텐츠는 담당 화면 구현 후 이 위치에 연결됩니다."
            />
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}
