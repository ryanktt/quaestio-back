import { User } from './user.schema';

import { Resolver } from '@nestjs/graphql';

@Resolver(() => User)
export class UserResolver {
	constructor() {}
}
