import {z} from 'zod';

export const PositionSchema = z.enum(['PRESIDENT','VICE_PRESIDENT','DIRECTOR','MEMBER']);
export type Position = z.infer<typeof PositionSchema>;
export const TermSchema = z.object({id:z.string(),name:z.string(),chartName:z.string().default('학생회'),startsAt:z.string(),endsAt:z.string(),managementActive:z.boolean()});
export const DepartmentSchema = z.object({id:z.string(),name:z.string(),sortOrder:z.number()});
export const MemberSchema = z.object({membershipId:z.string(),assignmentId:z.string().nullable(),name:z.string(),email:z.string(),phone:z.string().nullable(),profileImageUrl:z.string().nullable(),contactVisible:z.boolean(),position:PositionSchema.nullable(),departmentId:z.string().nullable(),sortOrder:z.number()});
export const ChartContextSchema=z.object({organizationId:z.string(),organizationName:z.string(),selectedTermId:z.string(),canEdit:z.boolean(),terms:z.array(TermSchema),departments:z.array(DepartmentSchema),members:z.array(MemberSchema)});
export type ChartContext=z.infer<typeof ChartContextSchema>;
export type ChartMember=z.infer<typeof MemberSchema>;
export type ChartDepartment=z.infer<typeof DepartmentSchema>;
export type ChartTerm=z.infer<typeof TermSchema>;
