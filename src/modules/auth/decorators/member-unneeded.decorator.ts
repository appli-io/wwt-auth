import { SetMetadata } from '@nestjs/common';

export const memberUnneededKey = 'companyMember';

export const MemberUnneeded = () => SetMetadata(memberUnneededKey, true);
