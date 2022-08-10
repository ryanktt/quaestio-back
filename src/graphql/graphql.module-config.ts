import { QuestionnaireModule, QuestionnaireRepository } from '@modules/questionnaire';
import { UserRepository, UserModule } from '@modules/user';
import { UtilsArray, UtilsModule } from '@utils/*';
import { loaders } from './graphql.data-loaders';

import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';

export default GraphQLModule.forRootAsync<ApolloDriverConfig>({
	driver: ApolloDriver,
	useFactory: (
		utilsArray: UtilsArray,
		userRepository: UserRepository,
		questionnaireRepository: QuestionnaireRepository,
	) => ({
		autoSchemaFile: 'schema.gql',
		context: {
			loaders: loaders(utilsArray, userRepository, questionnaireRepository),
		},
	}),
	inject: [UtilsArray, UserRepository, QuestionnaireRepository],
	imports: [UtilsModule, UserModule, QuestionnaireModule],
});
