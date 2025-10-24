import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TeamsProxyController } from './teams-proxy.controller';
import { PlayersProxyController } from './players-proxy.controller';
import { MatchesProxyController } from './matches-proxy.controller';
import { ReportsProxyController } from './reports-proxy.controller';
import { AuthProxyController } from './auth-proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: parseInt(process.env.SERVICE_TIMEOUT) || 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [
    TeamsProxyController,
    PlayersProxyController,
    MatchesProxyController,
    ReportsProxyController,
    AuthProxyController,
  ],
  providers: [ProxyService],
})
export class ProxyModule {}
