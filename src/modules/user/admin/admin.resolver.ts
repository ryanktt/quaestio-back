import { AdminService } from './admin.service';
import { Admin } from './admin.schema';

import { ObjectType, Resolver, Mutation, Context, Query, Field, Args } from '@nestjs/graphql';
import { IPublicContext } from '@modules/session/session.interface';
import { Session } from '@modules/session/session.schema';
import { Role } from '@utils/utils.decorators';

@ObjectType()
class SignInResponse {
	@Field(() => Session)
	session: Session;

	@Field(() => Admin)
	user: Admin;

	@Field()
	authToken: string;
}

@Resolver(() => Admin)
export class AdminResolver {
	constructor(private readonly adminService: AdminService) {}

	@Role('Admin')
	@Query(() => Admin, { nullable: true })
	async fetchAdmin(
		@Args('userId', { nullable: true }) userId?: string,
		@Args('email', { nullable: true }) email?: string,
	): Promise<Admin | undefined> {
		return this.adminService.fetch({ userId, email });
	}

	@Mutation(() => Admin)
	async publicSignUp(
		@Args('password') password: string,
		@Args('email') email: string,
		@Args('name') name: string,
	): Promise<Admin> {
		return this.adminService.signUp({ name, email, password });
	}

	@Mutation(() => SignInResponse)
	async publicSignIn(
		@Context() { clientIp, userAgent }: IPublicContext,
		@Args('password') password: string,
		@Args('email') email: string,
	): Promise<SignInResponse> {
		return this.adminService.signIn({ email, password, ip: clientIp, userAgent });
	}
}
