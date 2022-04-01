import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.schema';

@Resolver()
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query(() => User, { nullable: true })
	async fetchUser(
		@Args('userId', { nullable: true }) userId: string,
		@Args('email', { nullable: true }) email: string,
	): Promise<User | null> {
		return this.userService.fetch({ userId, email });
	}

	@Mutation(() => User)
	async signUpUser(
		@Args('phoneNumber') phoneNumber: string,
		@Args('email') email: string,
		@Args('name') name: string,
	): Promise<User> {
		return this.userService.signUp({ name, email, phoneNumber });
	}
}
