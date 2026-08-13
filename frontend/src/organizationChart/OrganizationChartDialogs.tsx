import {type FormEvent, useRef, useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {FileInput} from '@astryxdesign/core/FileInput';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {HStack, Layout, LayoutContent, LayoutFooter, VStack} from '@astryxdesign/core/Layout';
import {Selector} from '@astryxdesign/core/Selector';
import {Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import type {ChartContext, ChartTerm, Position} from './model';

function DialogActions({form, label, saving, onClose}: {form: string; label: string; saving: boolean; onClose: () => void}) {
  return <LayoutFooter><HStack gap={2} hAlign="end"><Button label="취소" variant="secondary" onClick={onClose}/><Button label={label} variant="primary" type="submit" form={form} isLoading={saving}/></HStack></LayoutFooter>;
}

export function DepartmentDialog({isOpen, onClose, onSave}: {isOpen: boolean; onClose: () => void; onSave: (name: string) => Promise<void>}) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSubmitted(true); if (!name.trim()) return; setSaving(true); try { await onSave(name.trim()); setName(''); onClose(); } finally { setSaving(false); } }
  return <Dialog isOpen={isOpen} onOpenChange={(open) => {if (!open) onClose();}} purpose="form" width={440}><Layout header={<DialogHeader title="국 추가" subtitle="조직도 마지막에 새 국을 추가합니다." onOpenChange={() => onClose()}/>} content={<LayoutContent><form id="department-form" onSubmit={submit}><TextInput label="국 이름" value={name} onChange={setName} placeholder="예: 대외협력국" isRequired status={submitted && !name.trim() ? {type: 'error', message: '국 이름을 입력해주세요.'} : undefined}/></form></LayoutContent>} footer={<DialogActions form="department-form" label="국 추가" saving={saving} onClose={onClose}/>}/></Dialog>;
}

function PhoneInput({value,onChange}:{value:string;onChange:(value:string)=>void}){
  const second=useRef<HTMLInputElement>(null);const third=useRef<HTMLInputElement>(null);
  const digits=value.replace(/\D/g,'').slice(0,11);const parts=[digits.slice(0,3),digits.slice(3,7),digits.slice(7,11)];
  function change(index:number,next:string){const lengths=[3,4,4];const clean=next.replace(/\D/g,'').slice(0,lengths[index]);const updated=[...parts];updated[index]=clean;onChange(updated.join(''));if(clean.length===lengths[index]) (index===0?second:third).current?.focus();}
  return <VStack gap={1}><Text type="label">전화번호 <Text type="supporting" color="secondary">(선택)</Text></Text><HStack gap={1} vAlign="center"><TextInput ref={useRef<HTMLInputElement>(null)} label="전화번호 앞자리" isLabelHidden value={parts[0]} onChange={(next)=>change(0,next)} placeholder="010" width="calc(var(--spacing-10) + var(--spacing-6))" size="sm"/><Text color="secondary">-</Text><TextInput ref={second} label="전화번호 가운데 자리" isLabelHidden value={parts[1]} onChange={(next)=>change(1,next)} placeholder="0000" width="calc(var(--spacing-10) * 2)" size="sm"/><Text color="secondary">-</Text><TextInput ref={third} label="전화번호 끝자리" isLabelHidden value={parts[2]} onChange={(next)=>change(2,next)} placeholder="0000" width="calc(var(--spacing-10) * 2)" size="sm"/></HStack></VStack>;
}

export function MemberDialog({context, isOpen, onClose, onSave}: {context: ChartContext; isOpen: boolean; onClose: () => void; onSave: (value: {membershipId: string; position: Position; departmentId?: string; phone: string; profileImageFile: File|null; currentProfileImageUrl: string; contactVisible: boolean}) => Promise<void>}) {
  const available = context.members.filter((member) => !member.assignmentId);
  const [membershipId, setMembershipId] = useState('');
  const [position, setPosition] = useState<Position>('MEMBER');
  const [departmentId, setDepartmentId] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File|null>(null);
  const [currentProfileImageUrl, setCurrentProfileImageUrl] = useState('');
  const [contactVisible, setContactVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const needsDepartment = position === 'DIRECTOR' || position === 'MEMBER';
  function selectMember(value: string | null) { const id = value ?? ''; setMembershipId(id); const member = context.members.find((item) => item.membershipId === id); setPhone(member?.phone ?? ''); setCurrentProfileImageUrl(member?.profileImageUrl ?? ''); setProfileImageFile(null); }
  async function submit(event: FormEvent) { event.preventDefault(); if (!membershipId || (needsDepartment && !departmentId)) return; setSaving(true); try { await onSave({membershipId, position, departmentId: needsDepartment ? departmentId : undefined, phone:phone.replace(/\D/g,'').replace(/(\d{3})(\d{4})(\d{4})/,'$1-$2-$3'), profileImageFile,currentProfileImageUrl, contactVisible}); onClose(); } finally { setSaving(false); } }
  return <Dialog isOpen={isOpen} onOpenChange={(open) => {if (!open) onClose();}} purpose="form" width={520}><Layout header={<DialogHeader title="구성원 배정" subtitle="한 기수에서는 한 직책만 맡을 수 있습니다." onOpenChange={() => onClose()}/>} content={<LayoutContent><form id="member-form" onSubmit={submit}><FormLayout><Selector label="구성원" options={available.map((member) => ({value: member.membershipId, label: `${member.name} · ${member.email}`}))} value={membershipId} onChange={selectMember} placeholder="가입 구성원 선택" hasSearch isRequired/><Selector label="직책" options={[{value: 'PRESIDENT', label: '회장'}, {value: 'VICE_PRESIDENT', label: '부회장'}, {value: 'DIRECTOR', label: '국장'}, {value: 'MEMBER', label: '국원'}]} value={position} onChange={(value) => setPosition(value as Position)} isRequired/>{needsDepartment ? <Selector label="소속 국" options={context.departments.map((department) => ({value: department.id, label: department.name}))} value={departmentId} onChange={(value) => setDepartmentId(value ?? '')} placeholder="국 선택" isRequired/> : null}<PhoneInput value={phone} onChange={setPhone}/><FileInput label="프로필 이미지" value={profileImageFile} onChange={(file)=>setProfileImageFile(file as File|null)} accept="image/jpeg,image/png,image/webp" maxSize={5242880} mode="dropzone" description="JPG, PNG, WebP · 최대 5MB" isOptional/><CheckboxInput label="조직 구성원에게 연락처 공개" value={contactVisible} onChange={setContactVisible}/></FormLayout></form></LayoutContent>} footer={<DialogActions form="member-form" label="구성원 배정" saving={saving} onClose={onClose}/>}/></Dialog>;
}

export function TermDialog({term,isOpen, onClose, onSave}: {term?:ChartTerm;isOpen: boolean; onClose: () => void; onSave: (value: {name: string;chartName:string; startsAt: string; endsAt: string}) => Promise<void>}) {
  type IsoDate=`${number}${number}${number}${number}-${number}${number}-${number}${number}`;
  const [name, setName] = useState(term?.name??'');const [chartName,setChartName]=useState(term?.chartName??''); const [startsAt, setStartsAt] = useState<IsoDate|undefined>(term?.startsAt as IsoDate|undefined); const [endsAt, setEndsAt] = useState<IsoDate|undefined>(term?.endsAt as IsoDate|undefined); const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); if (!name.trim() || !chartName.trim() || !startsAt || !endsAt) return; setSaving(true); try { await onSave({name: name.trim(),chartName:chartName.trim(), startsAt, endsAt}); onClose(); } finally { setSaving(false); } }
  return <Dialog isOpen={isOpen} onOpenChange={(open) => {if (!open) onClose();}} purpose="form" width={500}><Layout header={<DialogHeader title={term?'조직도 정보 수정':'새 기수 만들기'} subtitle={term?'표시 이름과 임기를 변경합니다.':'기본 3개 국이 함께 생성됩니다.'} onOpenChange={() => onClose()}/>} content={<LayoutContent><form id="term-form" onSubmit={submit}><FormLayout><TextInput label="조직도 이름" value={chartName} onChange={setChartName} placeholder="예: ONOFF" isRequired/><TextInput label="기수" value={name} onChange={setName} placeholder="예: 1기" isRequired/><DateInput label="임기 시작일" value={startsAt} onChange={setStartsAt} max={endsAt} format="system_date" isRequired/><DateInput label="임기 종료일" value={endsAt} onChange={setEndsAt} min={startsAt} format="system_date" isRequired/></FormLayout></form></LayoutContent>} footer={<DialogActions form="term-form" label={term?'변경사항 저장':'기수 만들기'} saving={saving} onClose={onClose}/>}/></Dialog>;
}
