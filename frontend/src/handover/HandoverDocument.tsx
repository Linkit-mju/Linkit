import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  VStack,
} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Heading, Text} from '@astryxdesign/core/Text';
import type {Handover, HandoverStatus} from './model';
import {statusLabel} from './model';

const STATUS_VARIANT = {
  draft: 'neutral',
  review: 'warning',
  complete: 'success',
} satisfies Record<HandoverStatus, 'neutral' | 'warning' | 'success'>;

const KOREAN_TEXT_STYLE = {wordBreak: 'keep-all'} as const;

function DocumentSection({
  emptyText,
  items,
  title,
}: {
  readonly emptyText: string;
  readonly items: readonly string[];
  readonly title: string;
}) {
  return (
    <Card>
      <VStack gap={3}>
        <Heading level={3}>{title}</Heading>
        {items.length > 0 ? (
          <List density="balanced" hasDividers>
            {items.map((item) => (
              <ListItem
                key={item}
                label={
                  <Text
                    type="body"
                    display="block"
                    textWrap="pretty"
                    style={KOREAN_TEXT_STYLE}>
                    {item}
                  </Text>
                }
              />
            ))}
          </List>
        ) : (
          <Text type="supporting" color="secondary">
            {emptyText}
          </Text>
        )}
      </VStack>
    </Card>
  );
}

export function HandoverDocument({
  categoryName,
  handover,
  onCreate,
  onDelete,
  onEdit,
}: {
  readonly categoryName: string | undefined;
  readonly handover: Handover | undefined;
  readonly onCreate: () => void;
  readonly onDelete: () => void;
  readonly onEdit: () => void;
}) {
  if (!handover) {
    return (
      <Layout
        height="fill"
        content={
          <LayoutContent>
            <Center height="100%">
              <VStack gap={3} hAlign="center">
                <Heading level={2}>인수인계를 선택해주세요</Heading>
                <Text type="supporting" color="secondary" justify="center">
                  왼쪽 카테고리에서 문서를 선택하거나 새 인수인계를 추가하세요.
                </Text>
                <Button
                  label="첫 인수인계 추가"
                  variant="primary"
                  onClick={onCreate}
                />
              </VStack>
            </Center>
          </LayoutContent>
        }
      />
    );
  }

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack
            gap={3}
            paddingInline={6}
            paddingBlock={4}
            hAlign="between"
            vAlign="center"
            wrap="wrap">
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                {categoryName ?? '미분류'}
              </Text>
              <Heading level={1}>{handover.title}</Heading>
            </VStack>
            <HStack gap={2} vAlign="center">
              <Button
                label="수정"
                variant="secondary"
                size="sm"
                onClick={onEdit}
              />
              <MoreMenu
                label="인수인계 메뉴"
                items={[{label: '삭제', onClick: onDelete}]}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6} label="인수인계 내용">
          <VStack gap={5}>
            <Card variant="muted">
              <HStack gap={4} hAlign="between" vAlign="center" wrap="wrap">
                <VStack gap={1}>
                  <Text type="label">담당자</Text>
                  <Text type="supporting" color="secondary">
                    {handover.owner}
                  </Text>
                </VStack>
                <VStack gap={1}>
                  <Text type="label">최근 수정</Text>
                  <Text type="supporting" color="secondary">
                    {handover.updatedAt}
                  </Text>
                </VStack>
                <VStack gap={1}>
                  <Text type="label">상태</Text>
                  <Badge
                    variant={STATUS_VARIANT[handover.status]}
                    label={statusLabel(handover.status)}
                  />
                </VStack>
              </HStack>
            </Card>

            <Card>
              <VStack gap={3}>
                <Heading level={3}>업무 요약</Heading>
                <Text
                  type="body"
                  display="block"
                  textWrap="pretty"
                  style={KOREAN_TEXT_STYLE}>
                  {handover.summary || '아직 작성된 요약이 없습니다.'}
                </Text>
              </VStack>
            </Card>

            <DocumentSection
              title="반드시 알아야 할 점"
              items={handover.criticalNotes}
              emptyText="주의 사항이 아직 없습니다."
            />
            <DocumentSection
              title="반복 업무와 일정"
              items={handover.recurringTasks}
              emptyText="등록된 반복 업무가 없습니다."
            />
            <DocumentSection
              title="체크리스트"
              items={handover.checklist}
              emptyText="체크리스트가 아직 없습니다."
            />
            <DocumentSection
              title="연락처와 참고 자료"
              items={handover.references}
              emptyText="등록된 참고 자료가 없습니다."
            />
            <DocumentSection
              title="미해결 질문"
              items={handover.openQuestions}
              emptyText="남겨진 질문이 없습니다."
            />
          </VStack>
        </LayoutContent>
      }
    />
  );
}
