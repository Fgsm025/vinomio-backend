import { IsEmail, IsString, IsEnum } from 'class-validator';
import { Role } from '../../auth/decorators/roles.decorator';

export class CreateInvitationDto {
  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;
}
