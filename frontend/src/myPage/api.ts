import {z} from 'zod';
import {requestJson,requestVoid} from '../api';

export const MyProfileSchema=z.object({userId:z.string(),name:z.string(),email:z.string(),emailVerifiedAt:z.string().nullable(),joinedAt:z.string().nullable(),membershipId:z.string().nullable(),organizationName:z.string().nullable(),phone:z.string().nullable(),profileImageUrl:z.string().nullable(),contactVisible:z.boolean()});
export type MyProfile=z.infer<typeof MyProfileSchema>;
export const getMyProfile=()=>requestJson('/api/v1/my-page',MyProfileSchema);
export const updateMyProfile=(input:{name:string;phone:string;profileImageUrl:string;contactVisible:boolean})=>requestVoid('/api/v1/my-page',{method:'PATCH',json:input});
