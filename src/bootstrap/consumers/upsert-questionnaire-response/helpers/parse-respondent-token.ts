/* eslint-disable no-undef */
import { IRespondentTokenPayload } from '../types/types';
import jwt from 'jsonwebtoken';
import Joi from 'joi';

export function parseRespondentToken(token: string): IRespondentTokenPayload {
	return Joi.attempt(
		jwt.verify(token, process.env.JWT_SECRET as string),
		Joi.object().keys({ respondentId: Joi.string().required() }).unknown(),
	) as IRespondentTokenPayload;
}
