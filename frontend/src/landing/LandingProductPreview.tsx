import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {Heading, Text} from '@astryxdesign/core/Text';

const PREVIEW_HANDOVERS = [
  {title: '대동제 운영 인수인계', owner: '기획국 김민지', status: '확인 필요'},
  {title: '신입생 OT 준비', owner: '기획국 박서준', status: '작성 중'},
  {title: '월별 예산 집행 및 정산', owner: '재정국 이서연', status: '전달 완료'},
] as const;

export function LandingProductPreview() {
  const selected = PREVIEW_HANDOVERS[0];

  return (
    <Card elevation="med" padding={6}>
      <Grid columns={{minWidth: 280, max: 2, repeat: 'fit'}} gap={8}>
        <VStack gap={4} hAlign="stretch">
          <VStack gap={1} hAlign="start">
            <Text type="label" color="accent">
              인수인계 워크스페이스
            </Text>
            <Heading level={3}>업무를 주제별로 한눈에</Heading>
          </VStack>
          <List
            density="spacious"
            hasDividers
            header={
              <Text type="supporting" color="secondary">
                행사 및 기획
              </Text>
            }>
            {PREVIEW_HANDOVERS.map((handover) => (
              <ListItem
                key={handover.title}
                label={handover.title}
                description={handover.owner}
                isSelected={handover === selected}
                endContent={
                  handover.status === '확인 필요' ? (
                    <Badge variant="warning" label={handover.status} />
                  ) : (
                    <Text type="supporting" color="secondary">
                      {handover.status}
                    </Text>
                  )
                }
              />
            ))}
          </List>
        </VStack>

        <VStack gap={5} hAlign="stretch">
          <VStack gap={2} hAlign="stretch">
            <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap">
              <Heading level={3}>{selected.title}</Heading>
              <Badge variant="warning" label={selected.status} />
            </HStack>
            <Text type="supporting" color="secondary">
              {selected.owner} · 오늘 오전 10:24
            </Text>
          </VStack>

          <Text as="p" textWrap="pretty">
            대동제 준비부터 당일 운영까지 필요한 일정, 교내 협의 창구, 업체 계약
            순서를 정리한 문서입니다.
          </Text>
          <Divider />

          <Grid columns={{minWidth: 220, max: 2, repeat: 'fit'}} gap={5}>
            <VStack gap={2} hAlign="stretch">
              <Heading level={4}>반드시 알아야 할 점</Heading>
              <Text as="p" type="supporting" textWrap="pretty">
                운동장 사용 신청은 행사 8주 전까지 학생지원팀에 제출합니다.
              </Text>
            </VStack>
            <VStack gap={2} hAlign="stretch">
              <Heading level={4}>다음 담당자의 체크리스트</Heading>
              <List density="compact" listStyle="disc">
                <ListItem label="학생지원팀 대관 공문 제출" />
                <ListItem label="행사 보험 가입" />
              </List>
            </VStack>
          </Grid>
        </VStack>
      </Grid>
    </Card>
  );
}
