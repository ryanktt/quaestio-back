import { UserService } from './user.service';
import { User } from './user.schema';

import { ObjectType, Resolver, Mutation, Context, Query, Field, Args } from '@nestjs/graphql';
import { IAdminContext, IPublicContext, Session, SessionService } from 'src/session';
import { forwardRef, Inject } from '@nestjs/common';
import { ERole, Role } from '@utils/*';

@ObjectType()
class SignInResponse {
	@Field(() => Session)
	session: Session;

	@Field(() => User)
	user: User;

	@Field()
	authToken: string;
}

@ObjectType()
class LogOutResponse {
	@Field(() => Session)
	session: Session;

	@Field(() => User)
	user: User;
}

@Resolver(() => User)
export class UserResolver {
	constructor(
		@Inject(forwardRef(() => SessionService)) private readonly sessionService: SessionService,
		private readonly userService: UserService,
	) {}

	@Role(ERole.ADMIN)
	@Query(() => User, { nullable: true })
	async fetchUser(
		@Args('userId', { nullable: true }) userId?: string,
		@Args('email', { nullable: true }) email?: string,
	): Promise<User | undefined> {
		return this.userService.fetch({ userId, email });
	}

	@Mutation(() => User)
	async signUp(
		@Args('password') password: string,
		@Args('email') email: string,
		@Args('name') name: string,
	): Promise<User> {
		return this.userService.signUp({ name, email, password });
	}

	@Mutation(() => SignInResponse)
	async signIn(
		@Context('req') { clientIp, userAgent }: IPublicContext,
		@Args('password') password: string,
		@Args('email') email: string,
	): Promise<SignInResponse> {
		return this.userService.signIn({ email, password, ip: clientIp, userAgent });
	}

	@Role(ERole.ADMIN)
	@Mutation(() => LogOutResponse)
	async logOut(@Context('req') { user, session }: IAdminContext): Promise<LogOutResponse> {
		await this.sessionService.deactivateSession(session);
		return { session, user };
	}
}
