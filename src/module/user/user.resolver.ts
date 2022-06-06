import { UserService } from './user.service';
import { User } from './user.schema';

import {
	GqlExecutionContext,
	ObjectType,
	Resolver,
	Mutation,
	Context,
	Query,
	Field,
	Args,
} from '@nestjs/graphql';
@ObjectType()
class SignInResponse {
	@Field(() => User)
	user: User;

	@Field()
	authToken: string;
}

@Resolver()
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	// @UseGuards(SessionGuard)
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
