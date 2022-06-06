import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserSchema } from './user.schema';
import { UserHelper } from './user.helper';

import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/shared.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), SharedModule],
	providers: [UserService, UserResolver, UserHelper],
})
export class UserModule {}
