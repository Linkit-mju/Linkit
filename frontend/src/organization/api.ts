import {postJson} from '../api/client';

export type JoinedOrganization = {
  id: string;
  name: string;
};

export function joinOrganization(inviteCode: string) {
  return postJson<JoinedOrganization>('/api/v1/organizations/join', {
    inviteCode,
  });
}
