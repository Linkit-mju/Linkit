import {requestJson,requestVoid} from '../api';
import {z} from 'zod';
import {ChartContextSchema,type ChartContext,type Position} from './model';
const UploadSchema=z.object({uploadUrl:z.string(),objectUrl:z.string(),headers:z.record(z.string(),z.string())});
export const getChart=(termId?:string):Promise<ChartContext>=>requestJson(`/api/v1/organization-chart${termId?`?termId=${encodeURIComponent(termId)}`:''}`,ChartContextSchema);
export const addDepartment=(termId:string,name:string)=>requestVoid('/api/v1/organization-chart/departments',{method:'POST',json:{termId,name}});
export const deleteDepartment=(id:string)=>requestVoid(`/api/v1/organization-chart/departments/${id}`,{method:'DELETE'});
export const assignMember=(input:{termId:string;membershipId:string;departmentId?:string;position:Position})=>requestVoid('/api/v1/organization-chart/assignments',{method:'POST',json:input});
export const unassignMember=(id:string)=>requestVoid(`/api/v1/organization-chart/assignments/${id}`,{method:'DELETE'});
export const updateProfile=(id:string,input:{phone:string;profileImageUrl:string;contactVisible:boolean})=>requestVoid(`/api/v1/organization-chart/members/${id}/profile`,{method:'PATCH',json:input});
export const createTerm=(input:{name:string;chartName:string;startsAt:string;endsAt:string})=>requestVoid('/api/v1/organization-terms',{method:'POST',json:input});
export const updateTerm=(id:string,input:{name:string;chartName:string;startsAt:string;endsAt:string})=>requestVoid(`/api/v1/organization-terms/${id}`,{method:'PATCH',json:input});
export const delegateTerm=(id:string)=>requestVoid(`/api/v1/organization-terms/${id}/delegate`,{method:'POST'});
export async function uploadProfileImage(membershipId:string,file:File){const signed=await requestJson(`/api/v1/organization-chart/members/${membershipId}/profile-image-upload`,UploadSchema,{method:'POST',json:{contentType:file.type,size:file.size}});const response=await fetch(signed.uploadUrl,{method:'PUT',headers:signed.headers,body:file});if(!response.ok) throw new Error('프로필 이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.');return signed.objectUrl;}
