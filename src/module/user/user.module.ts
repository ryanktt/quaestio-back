import { MongooseModule } from '@nestjs/mongoose';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserHelper } from './user.helper';
import { UserSchema } from './user.schema';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
	providers: [UserResolver, UserService, UserHelper],
})
export class UserModule {}
