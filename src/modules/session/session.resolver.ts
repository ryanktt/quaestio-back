import { Session } from './session.schema';

import { Resolver, ResolveField, Parent, Context } from '@nestjs/graphql';
import { ILoaders } from '@graphql/graphql.data-loaders';
import { User } from '@modules/user';

@Resolver(() => Session)
export class SessionResolver {
	@ResolveField(() => User)
	async user(@Parent() session: Session, @Context('loaders') { userLoader }: ILoaders): Promise<User> {
		return userLoader.load(session.user);
	}
}
