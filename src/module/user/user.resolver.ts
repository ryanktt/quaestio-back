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
import { IPublicContext } from '@modules/session';
import { ERole, Role } from '@utils/*';

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

	@Role(ERole.ADMIN)
	@Query(() => User, { nullable: true })
	async fetchUser(
		@Context() ctx: GqlExecutionContext,
		@Args('userId', { nullable: true }) userId?: string,
		@Args('email', { nullable: true }) email?: string,
	): Promise<User | null> {
		console.log(ctx);
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
}
