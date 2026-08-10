import { AppShell } from "@astryxdesign/core/AppShell";
import { Card } from "@astryxdesign/core/Card";
import { Grid } from "@astryxdesign/core/Grid";
import { Icon, type IconName } from "@astryxdesign/core/Icon";
import { HStack, Layout, VStack } from "@astryxdesign/core/Layout";
import { Link } from "@astryxdesign/core/Link";
import { NavIcon } from "@astryxdesign/core/NavIcon";
import { Section } from "@astryxdesign/core/Section";
import { Heading, Text } from "@astryxdesign/core/Text";
import { TopNav, TopNavHeading, TopNavItem } from "@astryxdesign/core/TopNav";
import { LandingProductPreview } from "./LandingProductPreview";

const BENEFITS = [
  {
    title: "흩어진 자료를 업무 맥락과 함께",
    description:
      "파일 위치만 남기는 대신 담당자, 주의 사항, 반복 일정과 참고 자료를 한 문서에 연결합니다.",
    icon: "search",
  },
  {
    title: "학생회 업무에 맞는 구조로",
    description:
      "행사, 회계, 홍보처럼 조직의 실제 업무 단위로 분류하고 필요한 항목을 빠짐없이 정리합니다.",
    icon: "viewColumns",
  },
  {
    title: "다음 임기가 바로 이어서",
    description:
      "확인할 내용과 체크리스트를 분리해 새 담당자가 첫날부터 다음 행동을 알 수 있게 합니다.",
    icon: "checkDouble",
  },
] satisfies readonly {
  readonly title: string;
  readonly description: string;
  readonly icon: IconName;
}[];

export function LandingPage() {
  return (
    <AppShell
      contentPadding={0}
      height="auto"
      variant="surface"
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
      }
    >
      <VStack gap={0} hAlign="stretch">
        <Section variant="transparent" padding={0}>
          <Layout height="auto" contentWidth={960} padding={10}>
            <VStack gap={8} hAlign="center">
              <VStack gap={4} hAlign="center">
                <Text type="label" color="accent">
                  명지대학교 학생회를 위한 인수인계 플랫폼
                </Text>
                <Heading level={1} textWrap="balance" justify="center">
                  학생회의 경험을 다음 임기로 연결하세요
                </Heading>
                <Text
                  as="p"
                  type="large"
                  color="secondary"
                  textWrap="pretty"
                  justify="center"
                >
                  담당자가 바뀔 때마다 다시 찾고 다시 묻던 업무를, 다음 사람이
                  바로 이어갈 수 있는 인수인계로 정리합니다.
                </Text>
              </VStack>
              <HStack gap={4} hAlign="center" vAlign="center" wrap="wrap">
                <Link href="/signup" isStandalone hasUnderline>
                  Linkit 시작하기
                </Link>
                <Link href="/workspace" isStandalone>
                  워크스페이스 미리보기
                </Link>
              </HStack>
            </VStack>
          </Layout>
        </Section>

        <Section variant="muted" padding={0}>
          <Layout height="auto" contentWidth={960} padding={10}>
            <VStack gap={8} hAlign="stretch">
              <VStack gap={2} hAlign="start">
                <Text type="label" color="accent">
                  임기가 바뀌어도 업무는 이어져야 하니까
                </Text>
                <Heading level={2} textWrap="balance">
                  다음 담당자가 궁금해할 내용을 먼저 정리합니다
                </Heading>
              </VStack>
              <Grid columns={{ minWidth: 240, max: 3, repeat: "fit" }} gap={5}>
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
          </Layout>
        </Section>

        <Section variant="section" padding={0}>
          <Layout height="auto" contentWidth={960} padding={10}>
            <VStack gap={8} hAlign="stretch">
              <VStack gap={2} hAlign="start">
                <Text type="label" color="accent">
                  실제 업무가 보이는 인수인계
                </Text>
                <Heading level={2} textWrap="balance">
                  파일 목록이 아니라, 다음 행동이 보이는 문서
                </Heading>
                <Text as="p" color="secondary" textWrap="pretty">
                  대동제 운영처럼 복잡한 업무도 핵심 주의 사항, 반복 일정,
                  체크리스트와 참고 자료로 나누어 전달합니다.
                </Text>
              </VStack>
              <LandingProductPreview />
            </VStack>
          </Layout>
        </Section>

        <Section variant="muted" padding={0} dividers={["top"]}>
          <Layout height="auto" contentWidth={960} padding={10}>
            <VStack gap={5} hAlign="center">
              <Heading level={2} textWrap="balance" justify="center">
                이번 임기의 경험을 다음 임기의 시작점으로
              </Heading>
              <Text as="p" color="secondary" textWrap="pretty" justify="center">
                학교 이메일로 가입하고, 우리 학생회의 첫 인수인계를
                정리해보세요.
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
          </Layout>
        </Section>
      </VStack>
    </AppShell>
  );
}
