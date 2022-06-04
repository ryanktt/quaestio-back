import { UserResolver, UserService, UserHelper, UserSchema } from '@modules/user';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
	providers: [UserResolver, UserService, UserHelper],
})
export class UserModule {}
