import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.schema';

@Resolver()
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@Query(() => User)
	async fetchUser(@Args('userId') userId: string): Promise<User> {
		return this.userService.fetchUserById(userId);
	}

	@Mutation(() => User)
	async signUp(
		@Args('name') name: string,
		@Args('email') email: string,
		@Args('phoneNumber') phoneNumber: string,
	): Promise<User> {
		return this.userService.createUser(name, email, phoneNumber);
	}
}
