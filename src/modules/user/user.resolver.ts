import { User } from './user.schema';
import { Parent, ResolveField, Resolver } from '@nestjs/graphql';

@Resolver(() => User)
export class UserResolver {
	@ResolveField(() => User)
	self(@Parent() user: User): User {
		return user;
	}
}
