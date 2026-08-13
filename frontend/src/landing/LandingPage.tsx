import {AppShell} from '@astryxdesign/core/AppShell';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon, type IconName} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Section} from '@astryxdesign/core/Section';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {LandingProductPreview} from './LandingProductPreview';

const BENEFITS = [
  {
    title: '흩어진 자료를 업무 맥락과 함께',
    description:
      '파일 위치만 남기는 대신 담당자, 주의 사항, 반복 일정과 참고 자료를 한 문서에 연결합니다.',
    icon: 'search',
  },
  {
    title: '학생회 업무에 맞는 구조로',
    description:
      '행사, 회계, 홍보처럼 조직의 실제 업무 단위로 분류하고 필요한 항목을 빠짐없이 정리합니다.',
    icon: 'viewColumns',
  },
  {
    title: '다음 임기가 바로 이어서',
    description:
      '확인할 내용과 체크리스트를 분리해 새 담당자가 첫날부터 다음 행동을 알 수 있게 합니다.',
    icon: 'checkDouble',
  },
] satisfies readonly {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
}[];

export function LandingPage() {
  return (
    <>
      <style>{`
        .linkit-landing .astryx-app-shell-header,
        .linkit-landing .astryx-layout-content { background: transparent; }
      `}</style>
      <AppShell
        className="linkit-landing"
        contentPadding={0}
        height="auto"
        variant="surface"
        style={{
          background:
            'radial-gradient(circle at 15% 35%, color-mix(in srgb, var(--color-text-blue) 12%, transparent), transparent 68%)',
        }}
        topNav={
          <TopNav
            label="Linkit 주 메뉴"
            heading={
              <TopNavHeading
                heading="Linkit"
                headingHref="/"
                logo={<NavIcon icon={<Icon icon="checkDouble" />} />}
              />
            }
            endContent={
              <HStack gap={1} vAlign="center">
                <TopNavItem label="로그인" href="/login" />
                <TopNavItem label="시작하기" href="/signup" />
              </HStack>
            }
          />
        }>
        <Section variant="transparent" padding={4}>
          <VStack width="100%" hAlign="center">
            <VStack width="100%" maxWidth={1120} gap={10} hAlign="stretch">
              <VStack as="section" paddingBlock={10}>
                <Grid
                  columns={{minWidth: 340, max: 2, repeat: 'fit'}}
                  gap={10}
                  align="center">
                  <VStack gap={8} hAlign="start">
                    <VStack gap={4} hAlign="start">
                      <Text type="label" color="accent">
                        명지대학교 학생회를 위한 인수인계 플랫폼
                      </Text>
                      <Heading level={1} type="display-1" textWrap="balance">
                        학생회의 경험을 다음 임기로 연결하세요
                      </Heading>
                      <Text as="p" type="large" color="secondary" textWrap="pretty">
                        담당자가 바뀔 때마다 다시 찾고 다시 묻던 업무를, 다음 사람이
                        바로 이어갈 수 있는 인수인계로 정리합니다.
                      </Text>
                    </VStack>
                    <HStack gap={4} hAlign="start" vAlign="center" wrap="wrap">
                      <Link href="/signup" isStandalone hasUnderline>
                        Linkit 시작하기
                      </Link>
                      <Link href="/workspace" isStandalone>
                        워크스페이스 미리보기
                      </Link>
                    </HStack>
                  </VStack>

                  <LandingProductPreview />
                </Grid>
              </VStack>

              <Divider />

              <VStack as="section" gap={8} paddingBlock={10} hAlign="stretch">
                <VStack gap={2} hAlign="start">
                  <Text type="label" color="accent">
                    임기가 바뀌어도 업무는 이어져야 하니까
                  </Text>
                  <Heading level={2} textWrap="balance">
                    다음 담당자가 궁금해할 내용을 먼저 정리합니다
                  </Heading>
                </VStack>
                <Grid columns={{minWidth: 240, max: 3, repeat: 'fit'}} gap={5}>
                  {BENEFITS.map((benefit) => (
                    <Card key={benefit.title} padding={5}>
                      <VStack gap={3} hAlign="start">
                        <Icon icon={benefit.icon} color="accent" size="lg" />
                        <Heading level={3}>{benefit.title}</Heading>
                        <Text as="p" color="secondary" textWrap="pretty">
                          {benefit.description}
                        </Text>
                      </VStack>
                    </Card>
                  ))}
                </Grid>
              </VStack>

              <Divider />

              <VStack as="section" gap={5} paddingBlock={10} hAlign="center">
                <Heading level={2} textWrap="balance" justify="center">
                  이번 임기의 경험을 다음 임기의 시작점으로
                </Heading>
                <Text as="p" color="secondary" textWrap="pretty" justify="center">
                  학교 이메일로 가입하고, 우리 학생회의 첫 인수인계를 정리해보세요.
                </Text>
                <HStack gap={4} hAlign="center" vAlign="center" wrap="wrap">
                  <Link href="/signup" isStandalone hasUnderline>
                    우리 학생회 연결 시작하기
                  </Link>
                  <Link href="/login" isStandalone>
                    기존 계정으로 로그인
                  </Link>
                </HStack>
              </VStack>
            </VStack>
          </VStack>
        </Section>
      </AppShell>
    </>
  );
}
