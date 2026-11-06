import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { SpeakersModule } from './speakers/speakers.module';

@Module({
  imports: [SpeakersModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
