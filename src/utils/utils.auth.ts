import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { EUserRole } from 'src/user';

export const Role = (role: keyof typeof EUserRole): CustomDecorator<string> => SetMetadata('role', role);
