import {
	Args,
	Field,
	Query,
	Context,
	Resolver,
	Mutation,
	InputType,
	GqlExecutionContext,
} from '@nestjs/graphql';
import { UserService, UserHelper, User } from '@modules/user';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@modules/auth';

@InputType()
class SignInResponse {
	@Field(() => User)
	user: User;

	@Field()
	authToken: string;
}

@Resolver()
export class UserResolver {
	constructor(private readonly userService: UserService, private readonly userHelper: UserHelper) {}

	@UseGuards(new AuthGuard())
	@Query(() => User, { nullable: true })
	async fetchUser(
		@Args('userId', { nullable: true }) userId?: string,
		@Args('email', { nullable: true }) email?: string,
	): Promise<User | null> {
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
		@Context() ctx: GqlExecutionContext,
		@Args('password') password: string,
		@Args('email') email: string,
	): Promise<SignInResponse> {
		return this.userService.signIn({ email, password, ip: '', userAgent: '' });
	}
}
