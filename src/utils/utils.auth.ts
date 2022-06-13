import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { EUserRole } from 'src/user';

export const Role = (role: EUserRole): CustomDecorator<string> => SetMetadata('role', role);
