import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TeamsClient } from './teams.client';
import { PlayersClient } from './players.client';
import { MatchesClient } from './matches.client';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [TeamsClient, PlayersClient, MatchesClient],
  exports: [TeamsClient, PlayersClient, MatchesClient],
})
export class ClientsModule {}
