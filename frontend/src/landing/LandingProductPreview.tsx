import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {List, ListItem} from '@astryxdesign/core/List';
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  INITIAL_HANDOVERS,
  statusLabel,
} from '../handover/model';

export function LandingProductPreview() {
  const previewHandover = INITIAL_HANDOVERS.at(0);

  if (!previewHandover) return null;

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
            {INITIAL_HANDOVERS.slice(0, 3).map((handover) => (
              <ListItem
                key={handover.id}
                label={handover.title}
                description={handover.owner}
                isSelected={handover.id === previewHandover.id}
                endContent={
                  handover.status === 'review' ? (
                    <Badge variant="warning" label={statusLabel(handover.status)} />
                  ) : (
                    <Text type="supporting" color="secondary">
                      {statusLabel(handover.status)}
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
              <Heading level={3}>{previewHandover.title}</Heading>
              <Badge variant="warning" label={statusLabel(previewHandover.status)} />
            </HStack>
            <Text type="supporting" color="secondary">
              {previewHandover.owner} · {previewHandover.updatedAt}
            </Text>
          </VStack>

          <Text as="p" textWrap="pretty">
            {previewHandover.summary}
          </Text>
          <Divider />

          <Grid columns={{minWidth: 220, max: 2, repeat: 'fit'}} gap={5}>
            <VStack gap={2} hAlign="stretch">
              <Heading level={4}>반드시 알아야 할 점</Heading>
              <Text as="p" type="supporting" textWrap="pretty">
                {previewHandover.criticalNotes[0]}
              </Text>
            </VStack>
            <VStack gap={2} hAlign="stretch">
              <Heading level={4}>다음 담당자의 체크리스트</Heading>
              <List density="compact" listStyle="disc">
                {previewHandover.checklist.slice(0, 2).map((item) => (
                  <ListItem key={item} label={item} />
                ))}
              </List>
            </VStack>
          </Grid>
        </VStack>
      </Grid>
    </Card>
  );
}
