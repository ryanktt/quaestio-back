import { Questionnaire, QuestionnaireDocument, QuestionnaireModel } from '@modules/questionnaire/schema';
import { EQuestionnaireErrorCode, IRepositoryFetchQuestionnairesParams } from '@modules/questionnaire/questionnaire.interface';
import { UtilsArray } from '@utils/utils.array';
import { InjectModel } from '@nestjs/mongoose';
import { AppError } from '@utils/utils.error';
import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import mongoose from 'mongoose';
import { escapeRegExp } from '@utils/utils.string';
import { FilterType } from '@utils/utils.schema';

@Injectable()
export class ResponseQuestionnaireRepository {
	constructor(
		@InjectModel('Questionnaire') private readonly questionnaireSchema: QuestionnaireModel,
		private readonly utilsArray: UtilsArray,
	) { }

	async fetchQuestionnaireByIds(questionnaireIds: string[]): Promise<Questionnaire[]> {
		return this.questionnaireSchema
			.find({ _id: { $in: questionnaireIds } })
			.lean()
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires by ids',
					originalError,
				});
			}) as Promise<Questionnaire[]>;
	}

	async fetchQuestionnaires({
		questionnaireSharedIds,
		questionnaireIds,
		textFilter,
		userIds,
		latest,
	}: IRepositoryFetchQuestionnairesParams): Promise<Questionnaire[]> {
		const query: FilterType<QuestionnaireDocument> = {};
		if (typeof latest === 'boolean') query.latest = latest;
		if (questionnaireSharedIds) query.sharedId = { $in: questionnaireSharedIds };
		if (questionnaireIds) query._id = { $in: questionnaireIds };
		if (userIds) query.user = { $in: userIds };
		if (textFilter) {
			const escapedfilter = escapeRegExp(textFilter);
			query.$or = [
				{ sharedId: { $regex: escapedfilter, $options: 'i' } },
				{ title: { $regex: escapedfilter, $options: 'i' } },
				{ description: { $regex: escapedfilter, $options: 'i' } },
				{ 'questions.description': { $regex: escapedfilter, $options: 'i' } },
				{ 'questions.title': { $regex: escapedfilter, $options: 'i' } },
			];
			const isFilterId = mongoose.isValidObjectId(textFilter);
			if (isFilterId) {
				query.$or.push(
					{ 'questions._id': textFilter },
					{ '_id': textFilter },
				);
			}
		}

		return this.questionnaireSchema
			.find(query)
			.sort({ updatedAt: -1 })
			.lean()
			.exec()
			.catch((originalError: Error) => {
				throw new AppError({
					code: EQuestionnaireErrorCode.FETCH_QUESTIONNAIRES_ERROR,
					message: 'fail to fetch questionnaires',
					originalError,
				});
			}) as Promise<Questionnaire[]>;
	}


	questionnaireLoader(): DataLoader<string, Questionnaire> {
		return new DataLoader<string, Questionnaire>(async (ids: string[]) => {
			const questionnaires = await this.fetchQuestionnaireByIds(ids);
			return this.utilsArray.getObjectsSortedByIds(questionnaires, '_id', ids);
		});
	}

	async fetchQuestionnaireById(id: string): Promise<Questionnaire | undefined> {
		return this.questionnaireLoader().load(id);
	}
}
