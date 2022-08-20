import { RespondentRepository } from './respondent/respondent.repository';
import { RespondentHelper } from './respondent/respondent.helper';
import { RespondentSchema } from './respondent/respondent.schema';
import { AdminRepository } from './admin/admin.repository';
import { AdminResolver } from './admin/admin.resolver';
import { AdminService } from './admin/admin.service';
import { AdminSchema } from './admin/admin.schema';
import { UserRepository } from './user.repository';
import { UserResolver } from './user.resolver';
import { UserSchema } from './user.schema';
import { UserHelper } from './user.helper';

import { UserSessionModule } from '@modules/shared/user-session/user-session.module';
import { UtilsPromise } from '@utils/utils.promise';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsArray } from '@utils/utils.array';
import { Module } from '@nestjs/common';

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
		UserSessionModule,
	],
	providers: [
		UserRepository,
		UserResolver,
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
