import { SessionService } from './session.service';
import { SessionSchema } from './session.schema';
import { SessionHelper } from './session.helper';

import { MongooseModule } from '@nestjs/mongoose';
import { SharedModule } from 'src/shared.module';
import { Module } from '@nestjs/common';

@Module({
	imports: [MongooseModule.forFeature([{ name: 'Session', schema: SessionSchema }]), SharedModule],
	providers: [SessionHelper, SessionService],
})
export class SessionModule {}
