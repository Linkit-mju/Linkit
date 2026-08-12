import {useEffect, useState} from 'react';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {AppShell} from '@astryxdesign/core/AppShell';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Divider} from '@astryxdesign/core/Divider';
import {HStack, LayoutContent, VStack} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {Heading, Text} from '@astryxdesign/core/Text';
import {useToast} from '@astryxdesign/core/Toast';
import {
  addDepartment, assignMember, createTerm, delegateTerm,
  deleteDepartment, getChart, unassignMember, updateProfile, updateTerm, uploadProfileImage,
} from './api';
import {DepartmentDialog, MemberDialog, TermDialog} from './OrganizationChartDialogs';
import {MemberCard} from './MemberCard';
import {OrganizationChartSideNav} from './OrganizationChartSideNav';
import type {ChartContext, ChartDepartment, ChartMember} from './model';

const NODE_WIDTH = 'calc(var(--spacing-10) * 7)';

function VerticalConnector({height = 5}: {height?: number}) {
  return <Center axis="horizontal" style={{height: `var(--spacing-${height})`}} aria-hidden="true"><Divider orientation="vertical" variant="strong"/></Center>;
}

function EmptyNode({label, description}: {label: string; description?: string}) {
  return (
    <Card padding={3} variant="muted" width="100%">
      <VStack gap={0.5} hAlign="center">
        <Text type="label" color="secondary">{label}</Text>
        {description ? <Text type="supporting" color="secondary">{description}</Text> : null}
      </VStack>
    </Card>
  );
}

export function OrganizationChartPage() {
  const toast = useToast();
  const [context, setContext] = useState<ChartContext>();
  const [error, setError] = useState('');
  const [departmentOpen, setDepartmentOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChartDepartment>();
  const [removeTarget, setRemoveTarget] = useState<ChartMember>();

  useEffect(() => {
    let active = true;
    getChart().then((value) => {if (active) setContext(value);}).catch((value: unknown) => {
      if (active) setError(value instanceof Error ? value.message : '조직도를 불러오지 못했습니다.');
    });
    return () => {active = false;};
  }, []);

  async function load(termId?: string) {
    setError('');
    try { setContext(await getChart(termId)); }
    catch (value) { setError(value instanceof Error ? value.message : '조직도를 불러오지 못했습니다.'); }
  }

  async function action(work: () => Promise<void>, message: string) {
    try {
      await work();
      await load(context?.selectedTermId);
      toast({body: message, uniqueID: message});
    } catch (value) {
      toast({body: value instanceof Error ? value.message : '요청을 처리하지 못했습니다.', uniqueID: 'chart-error'});
    }
  }

  function removeMember(member: ChartMember) {
    const selected=context?.terms.find((term)=>term.id===context.selectedTermId);
    if(selected?.managementActive&&member.position&&member.position!=='MEMBER'){setRemoveTarget(member);return;}
    if (member.assignmentId) void action(() => unassignMember(member.assignmentId!), '배정을 해제했습니다.');
  }

  if (!context) {
    return (
      <AppShell contentPadding={0} height="fill" variant="elevated" sideNav={<OrganizationChartSideNav/>}>
        <Center axis="both">
          <VStack gap={4} hAlign="center">
            {error ? <Banner status="error" title={error} description="조직 가입 상태와 권한을 확인해주세요."/> : <Text type="body" color="secondary">조직도를 불러오는 중입니다.</Text>}
            {error && error.includes('조직') ? <Button label="조직 가입으로 이동" variant="primary" onClick={() => window.location.assign('/organization/join')}/> : null}
          </VStack>
        </Center>
      </AppShell>
    );
  }

  const president = context.members.find((member) => member.position === 'PRESIDENT');
  const vicePresidents = context.members.filter((member) => member.position === 'VICE_PRESIDENT');
  const selectedTerm = context.terms.find((term) => term.id === context.selectedTermId);

  return (
    <>
      <AppShell contentPadding={0} height="fill" variant="elevated" sideNav={<OrganizationChartSideNav/>}>
        <LayoutContent padding={6}>
          <VStack gap={6} hAlign="stretch">
            <HStack gap={4} hAlign="between" vAlign="end" wrap="wrap">
              <VStack gap={1}>
                <Text type="supporting" color="secondary">{context.organizationName}</Text>
                <Heading level={1}>조직도</Heading>
                <Text type="body" color="secondary">기수별 역할과 연락망을 한눈에 확인하세요.</Text>
              </VStack>
              <HStack gap={2} vAlign="end" wrap="wrap">
                <Selector label="기수" value={context.selectedTermId} options={context.terms.map((term) => ({value: term.id, label: `${term.chartName} · ${term.name}${term.managementActive ? ' · 관리자' : ''}`}))} onChange={(value) => {if (value) void load(value);}} size="sm"/>
                {context.canEdit ? <Button label="새 기수" variant="secondary" size="sm" onClick={() => setTermOpen(true)}/> : null}
                {context.canEdit && !selectedTerm?.managementActive ? <Button label="관리 기수로 지정" variant="secondary" size="sm" onClick={() => setDelegateOpen(true)}/> : null}
              </HStack>
            </HStack>
            {selectedTerm?.managementActive ? <Banner status="info" title={`${selectedTerm.name}는 현재 관리 기수입니다.`} description="활성 관리 기수가 두 개일 때 새 기수를 위임하면 가장 오래된 기수의 권한이 자동 해제됩니다."/> : null}
            <Card padding={0} elevation="low" width="100%" style={{overflow: 'auto'}}>
              <VStack gap={0} hAlign="stretch" style={{minWidth: `calc(${Math.max(3, context.departments.length)} * var(--spacing-10) * 8)`}}>
                <HStack gap={3} hAlign="between" vAlign="center" wrap="wrap" style={{padding: 'var(--spacing-5)', position: 'sticky', left: 0}}>
                  <VStack gap={0.5}>
                    <HStack gap={2} vAlign="center"><Heading level={2}>{selectedTerm?.chartName} 조직도</Heading><Text type="body" color="secondary">— {selectedTerm?.name}</Text>{context.canEdit?<Button label="조직도 정보 수정" variant="ghost" size="sm" onClick={()=>setEditingTerm(true)}>수정</Button>:null}</HStack>
                    <Text type="supporting" color="secondary">가로로 이동해 전체 구조를 확인하고, 카드를 눌러 연락처를 보세요.</Text>
                  </VStack>
                  {context.canEdit ? <HStack gap={2}><Button label="구성원 배정" variant="secondary" size="sm" onClick={() => setMemberOpen(true)}/><Button label="국 추가" variant="primary" size="sm" onClick={() => setDepartmentOpen(true)}/></HStack> : null}
                </HStack>
                <Divider/>
                <VStack gap={0} hAlign="center" style={{padding: 'var(--spacing-8)'}}>
                  <VStack gap={1} hAlign="center" style={{width: NODE_WIDTH}}>
                    <Text type="supporting" color="secondary">회장단</Text>
                    {president ? <MemberCard member={president} canEdit={context.canEdit} onRemove={removeMember}/> : <EmptyNode label="회장 미배정"/>}
                  </VStack>
                  <VerticalConnector height={6}/>
                  <HStack gap={4} hAlign="center" vAlign="start">
                    {vicePresidents.map((member) => <VStack key={member.membershipId} style={{width: NODE_WIDTH}}><MemberCard member={member} canEdit={context.canEdit} onRemove={removeMember}/></VStack>)}
                    {vicePresidents.length===0?<VStack style={{width: NODE_WIDTH}}><EmptyNode label="부회장 미배정"/></VStack>:null}
                  </HStack>
                  <VerticalConnector height={8}/>
                  <Divider variant="strong"/>
                  <HStack gap={6} hAlign="center" vAlign="start" width="100%">
                  {context.departments.map((department) => {
                    const director = context.members.find((member) => member.departmentId === department.id && member.position === 'DIRECTOR');
                    const members = context.members.filter((member) => member.departmentId === department.id && member.position === 'MEMBER');
                    return <VStack key={department.id} gap={0} hAlign="center" style={{width: NODE_WIDTH, flexShrink: 0}}>
                      <VerticalConnector height={5}/>
                      <Card padding={3} variant="blue" width="100%"><HStack gap={2} hAlign="between" vAlign="center"><VStack gap={0.5}><Heading level={3}>{department.name}</Heading><Text type="supporting" color="secondary">{members.length + (director ? 1 : 0)}명</Text></VStack>{context.canEdit ? <Button label={`${department.name} 삭제`} variant="ghost" size="sm" onClick={() => setDeleteTarget(department)}>삭제</Button> : null}</HStack></Card>
                      <VerticalConnector/>
                      {director ? <MemberCard member={director} canEdit={context.canEdit} onRemove={removeMember}/> : <EmptyNode label="국장 미배정"/>}
                      <VerticalConnector/>
                      <VStack gap={3} hAlign="stretch" width="100%">
                        {members.map((member) => <MemberCard key={member.membershipId} member={member} canEdit={context.canEdit} onRemove={removeMember}/>)}
                        {members.length === 0 ? <EmptyNode label="국원 없음" description="구성원을 배정해 주세요"/> : null}
                      </VStack>
                    </VStack>;
                  })}
                  </HStack>
                </VStack>
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      </AppShell>
      <DepartmentDialog isOpen={departmentOpen} onClose={() => setDepartmentOpen(false)} onSave={(name) => action(() => addDepartment(context.selectedTermId, name), '국을 추가했습니다.')}/>
      <MemberDialog context={context} isOpen={memberOpen} onClose={() => setMemberOpen(false)} onSave={(value) => action(async () => {const profileImageUrl=value.profileImageFile?await uploadProfileImage(value.membershipId,value.profileImageFile):value.currentProfileImageUrl;await updateProfile(value.membershipId, {phone: value.phone, profileImageUrl, contactVisible: value.contactVisible}); await assignMember({termId: context.selectedTermId, membershipId: value.membershipId, position: value.position, departmentId: value.departmentId});}, '구성원을 배정했습니다.')}/>
      <TermDialog isOpen={termOpen} onClose={() => setTermOpen(false)} onSave={(value) => action(() => createTerm(value), '새 기수를 만들었습니다.')}/>
      <TermDialog key={`${selectedTerm?.id}-${editingTerm}`} term={selectedTerm} isOpen={editingTerm} onClose={()=>setEditingTerm(false)} onSave={(value)=>action(()=>updateTerm(context.selectedTermId,value),'조직도 정보를 수정했습니다.')}/>
      <AlertDialog isOpen={Boolean(deleteTarget)} onOpenChange={(open) => {if (!open) setDeleteTarget(undefined);}} title="국을 삭제할까요?" description={deleteTarget ? `“${deleteTarget.name}”에 구성원이 있으면 삭제할 수 없습니다.` : ''} actionLabel="국 삭제" cancelLabel="취소" onAction={() => {if (deleteTarget) void action(() => deleteDepartment(deleteTarget.id), '국을 삭제했습니다.'); setDeleteTarget(undefined);}}/>
      <AlertDialog isOpen={Boolean(removeTarget)} onOpenChange={(open)=>{if(!open)setRemoveTarget(undefined);}} title="조직 관리자 배정을 해제할까요?" description={removeTarget?`${removeTarget.name}님의 ${removeTarget.position==='PRESIDENT'?'회장':removeTarget.position==='VICE_PRESIDENT'?'부회장':'국장'} 배정을 해제하면 조직도 수정 권한을 잃을 수 있습니다.`:''} actionLabel="배정 해제" cancelLabel="취소" onAction={()=>{if(removeTarget?.assignmentId)void action(()=>unassignMember(removeTarget.assignmentId!),'배정을 해제했습니다.');setRemoveTarget(undefined);}}/>
      <AlertDialog isOpen={delegateOpen} onOpenChange={setDelegateOpen} title={`${selectedTerm?.name ?? ''}를 관리 기수로 지정할까요?`} description={context.terms.filter((term)=>term.managementActive).length>=2?'현재 관리 기수가 이미 두 개이므로, 지정하면 가장 오래된 관리 기수의 권한이 자동으로 해제됩니다.':'지정 후 이 기수의 회장·부회장·국장은 다른 기수를 관리 기수로 지정하고 조직도를 수정할 수 있습니다.'} actionLabel="관리 기수로 지정" actionVariant="primary" cancelLabel="취소" onAction={()=>{setDelegateOpen(false);void action(()=>delegateTerm(context.selectedTermId),'관리 기수로 지정했습니다.');}}/>
    </>
  );
}
