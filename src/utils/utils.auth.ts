import { CustomDecorator, SetMetadata } from '@nestjs/common';

export enum ERole {
	ADMIN = 'ADMIN',
}

export const Role = (role: ERole): CustomDecorator<string> => SetMetadata('role', role);
