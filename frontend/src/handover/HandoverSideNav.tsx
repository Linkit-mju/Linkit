import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {
  SideNav,
  SideNavHeading,
  SideNavItem,
  SideNavSection,
} from '@astryxdesign/core/SideNav';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import type {
  Category,
  Handover,
  HandoverId,
  HandoverStatus,
} from './model';
import {categoryIcon, statusLabel} from './model';

const STATUS_DOT = {
  draft: 'neutral',
  review: 'warning',
  complete: 'success',
} satisfies Record<
  HandoverStatus,
  'neutral' | 'warning' | 'success'
>;

export function HandoverSideNav({
  categories,
  handovers,
  onCreateCategory,
  onCreateHandover,
  onDeleteCategory,
  onEditCategory,
  onSelect,
  onSearchChange,
  search,
  selectedId,
}: {
  readonly categories: readonly Category[];
  readonly handovers: readonly Handover[];
  readonly onCreateCategory: () => void;
  readonly onCreateHandover: () => void;
  readonly onDeleteCategory: (category: Category) => void;
  readonly onEditCategory: (category: Category) => void;
  readonly onSelect: (id: HandoverId) => void;
  readonly onSearchChange: (value: string) => void;
  readonly search: string;
  readonly selectedId: HandoverId | undefined;
}) {
  const [isCollapsed, setCollapsed] = useState(false);
  const normalizedSearch = search.trim().toLocaleLowerCase('ko-KR');

  return (
    <SideNav
      collapsible={{isCollapsed, onCollapsedChange: setCollapsed}}
      header={
        <SideNavHeading
          heading="Linkit"
          subheading="인수인계 워크스페이스"
          headingHref="/"
          icon={<NavIcon icon={<Icon icon="checkDouble" size="sm" />} />}
        />
      }
      topContent={
        isCollapsed ? undefined : (
          <VStack gap={2} padding={2}>
            <Button
              label="인수인계 추가"
              variant="primary"
              width="100%"
              onClick={onCreateHandover}
              isDisabled={categories.length === 0}
            />
            <Button
              label="카테고리 추가"
              variant="secondary"
              width="100%"
              onClick={onCreateCategory}
            />
            <TextInput
              label="인수인계 검색"
              value={search}
              onChange={onSearchChange}
              placeholder="제목 또는 담당자 검색"
              startIcon="search"
              isLabelHidden
              size="sm"
            />
          </VStack>
        )
      }
      footer={
        <SideNavSection title="계정" isHeaderHidden>
          <SideNavItem label="2027 학생회" icon="checkDouble" href="#" />
          <SideNavItem label="마이페이지" icon="wrench" href="/my-page" />
        </SideNavSection>
      }>
      <SideNavSection title="운영">
        <SideNavItem label="인수인계" icon="checkDouble" href="/workspace" isSelected />
        <SideNavItem label="조직도" icon="group" href="/organization-chart" />
      </SideNavSection>
      <Divider />
      <SideNavSection title="카테고리">
        {categories.map((category) => {
          const categoryHandovers = handovers.filter(
            (handover) =>
              handover.categoryId === category.id &&
              (normalizedSearch === '' ||
                handover.title.toLocaleLowerCase('ko-KR').includes(normalizedSearch) ||
                handover.owner.toLocaleLowerCase('ko-KR').includes(normalizedSearch)),
          );

          return (
            <VStack key={category.id} gap={1}>
              {isCollapsed ? null : (
                <HStack
                  gap={2}
                  paddingInline={3}
                  paddingBlock={1}
                  hAlign="between"
                  vAlign="center">
                  <HStack gap={2} vAlign="center">
                    <Icon icon={categoryIcon(category.name)} size="sm" />
                    <Text type="label">{category.name}</Text>
                  </HStack>
                  <MoreMenu
                    label={`${category.name} 카테고리 메뉴`}
                    size="sm"
                    items={[
                      {label: '이름 수정', onClick: () => onEditCategory(category)},
                      {type: 'divider'},
                      {label: '카테고리 삭제', onClick: () => onDeleteCategory(category)},
                    ]}
                  />
                </HStack>
              )}
              <VStack gap={0.5} paddingInline={2}>
                {categoryHandovers.length > 0 ? (
                  categoryHandovers.map((handover) => (
                    <SideNavItem
                      key={handover.id}
                      label={handover.title}
                      icon={isCollapsed ? categoryIcon(category.name) : undefined}
                      href="#"
                      isSelected={handover.id === selectedId}
                      onClick={(event) => {
                        event.preventDefault();
                        onSelect(handover.id);
                      }}
                      endContent={
                        <StatusDot
                          variant={STATUS_DOT[handover.status]}
                          label={statusLabel(handover.status)}
                          tooltip={statusLabel(handover.status)}
                        />
                      }
                    />
                  ))
                ) : !isCollapsed ? (
                  <VStack paddingInline={3} paddingBlock={2}>
                    <Text type="supporting" color="secondary">
                      {normalizedSearch ? '검색 결과 없음' : '인수인계 없음'}
                    </Text>
                  </VStack>
                ) : null}
              </VStack>
            </VStack>
          );
        })}
      </SideNavSection>
    </SideNav>
  );
}
