import { AdminService } from './admin.service';
import { EUserRole } from '../user.interface';
import { Admin } from './admin.schema';

import { ObjectType, Resolver, Mutation, Context, Query, Field, Args } from '@nestjs/graphql';
import { IAdminContext, IPublicContext, Session, SessionService } from 'src/session';
import { forwardRef, Inject } from '@nestjs/common';
import { Role } from '@utils/*';

@ObjectType()
class SignInResponse {
	@Field(() => Session)
	session: Session;

	@Field(() => Admin)
	user: Admin;

	@Field()
	authToken: string;
}

@ObjectType()
class LogOutResponse {
	@Field(() => Session)
	session: Session;

	@Field(() => Admin)
	user: Admin;
}

@Resolver(() => Admin)
export class AdminResolver {
	constructor(
		@Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService,
		private readonly adminService: AdminService,
	) {}

	@Role(EUserRole.Admin)
	@Query(() => Admin, { nullable: true })
	async fetchAdmin(
		@Args('userId', { nullable: true }) userId?: string,
		@Args('email', { nullable: true }) email?: string,
	): Promise<Admin | undefined> {
		return this.adminService.fetch({ userId, email });
	}

	@Mutation(() => Admin)
	async signUp(
		@Args('password') password: string,
		@Args('email') email: string,
		@Args('name') name: string,
	): Promise<Admin> {
		return this.adminService.signUp({ name, email, password });
	}

	@Mutation(() => SignInResponse)
	async signIn(
		@Context('req') { clientIp, userAgent }: IPublicContext,
		@Args('password') password: string,
		@Args('email') email: string,
	): Promise<SignInResponse> {
		return this.adminService.signIn({ email, password, ip: clientIp, userAgent });
	}

	@Role(EUserRole.Admin)
	@Mutation(() => LogOutResponse)
	async logOut(@Context('req') { user, session }: IAdminContext): Promise<LogOutResponse> {
		await this.sessionService.deactivateSession(session);
		return { session, user };
	}
}
