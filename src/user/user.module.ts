import { RespondentRepository, RespondentSchema, RespondentHelper } from './respondent';
import { AdminSchema, AdminRepository, AdminService, AdminResolver } from './admin';
import { UserRepository } from './user.repository';
import { UserSchema } from './user.schema';
import { UserHelper } from './user.helper';

import { forwardRef, Module } from '@nestjs/common';
import { UtilsArray, UtilsPromise } from '@utils/*';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from 'src/session';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'User',
				schema: UserSchema,
				discriminators: [
					{ name: 'Respondent', schema: RespondentSchema },
					{ name: 'Admin', schema: AdminSchema },
				],
			},
		]),
		forwardRef(() => SessionModule),
	],
	providers: [
		UserRepository,
		UserHelper,
		RespondentRepository,
		RespondentHelper,
		AdminRepository,
		AdminResolver,
		AdminService,
		UtilsPromise,
		UtilsArray,
	],
	exports: [
		UserRepository,
		UserHelper,
		RespondentRepository,
		RespondentHelper,
		AdminRepository,
		AdminResolver,
		AdminService,
	],
})
export class UserModule {}
