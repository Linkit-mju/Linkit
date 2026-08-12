import {useState} from 'react';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {Text} from '@astryxdesign/core/Text';
import type {ChartMember} from './model';

const POSITION_LABEL = {
  PRESIDENT: '회장',
  VICE_PRESIDENT: '부회장',
  DIRECTOR: '국장',
  MEMBER: '국원',
} as const;

export function MemberCard({member, canEdit, onRemove}: {
  member: ChartMember;
  canEdit: boolean;
  onRemove: (member: ChartMember) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card padding={4} width="100%" elevation={member.position === 'PRESIDENT' ? 'med' : 'low'}>
      <VStack gap={2} hAlign="stretch">
        <HStack gap={3} vAlign="center">
          <Avatar name={member.name} src={member.profileImageUrl ?? undefined} size="md" />
          <VStack gap={0.5} style={{flex: '1', minWidth: 0}}>
            <Text type="label" weight="bold">{member.name}</Text>
            <Text type="supporting" color="secondary">
              {member.position ? POSITION_LABEL[member.position] : ''}
            </Text>
          </VStack>
        </HStack>
        <Button label={expanded ? '연락처 접기' : '연락처 보기'} variant="ghost" size="sm" width="100%" onClick={() => setExpanded((value) => !value)} />
        {expanded ? (
          <VStack gap={2} hAlign="stretch">
            <Text type="supporting" color="secondary">연락처</Text>
            {member.contactVisible && member.phone ? (
              <Link href={`tel:${member.phone}`} isStandalone>{member.phone}</Link>
            ) : <Text type="body">등록되지 않음</Text>}
            {member.contactVisible ? (
              <Link href={`mailto:${member.email}`} isStandalone>{member.email}</Link>
            ) : <Text type="body">비공개</Text>}
            {canEdit && member.assignmentId ? (
              <Button
                label="조직도에서 배정 해제"
                variant="secondary"
                size="sm"
                width="100%"
                onClick={() => onRemove(member)}
              />
            ) : null}
          </VStack>
        ) : null}
      </VStack>
    </Card>
  );
}
