/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ESessionErrorCode, IAdminContext, IRespondentContext } from './session.interface';
import { SessionService } from './session.service';

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { EUserRole, RespondentDocument, AdminDocument } from 'src/user';
import { Reflector } from '@nestjs/core';
import { AppError } from '@utils/*';

@Injectable()
export class SessionGuard implements CanActivate {
	constructor(private readonly sessionService: SessionService, private readonly reflector: Reflector) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.getArgByIndex(2).req;

		const authToken = req.headers.auth as string;
		const userAgent = req.headers['user-agent'];

		req.userAgent = userAgent;
		req.authToken = authToken;

		const ctxRole = this.reflector.get<EUserRole>('role', context.getHandler());
		if (ctxRole) {
			const { user, session } = await this.sessionService.authenticateUser(authToken);
			if (user.role !== ctxRole) {
				throw new AppError({ code: ESessionErrorCode.INVALID_SESSION, message: 'invalid session' });
			}
			if (ctxRole === EUserRole.Admin) {
				const adminRequest = req as IAdminContext;
				adminRequest.user = user as AdminDocument;
				adminRequest.session = session;
			}
			if (ctxRole === EUserRole.Respondent) {
				const respondentRequest = req as IRespondentContext;
				respondentRequest.user = user as RespondentDocument;
				respondentRequest.session = session;
			}
		}

		return true;
	}
}
