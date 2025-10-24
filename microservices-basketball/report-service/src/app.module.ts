import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ReportsModule } from './reports/reports.module';
import { PdfModule } from './pdf/pdf.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    DatabaseModule,
    ReportsModule,
    PdfModule,
    ClientsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
