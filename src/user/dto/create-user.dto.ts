import { UserRole } from '../enums/user-role.enum';

export class CreateUserDto {
  readonly organizationId?: string | null;
  readonly outletId?: string | null;
  readonly role: UserRole;
  readonly email: string;
  readonly passwordHash: string;
}
