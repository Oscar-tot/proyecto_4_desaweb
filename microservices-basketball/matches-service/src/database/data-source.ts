import { DataSource, DataSourceOptions } from 'typeorm';
import { Match } from '../entities/match.entity';
import { MatchEvent } from '../entities/match-event.entity';
import { MatchStats } from '../entities/match-stats.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'mysqlweb',
  password: process.env.DB_PASSWORD || 'mysql123@',
  database: process.env.DB_DATABASE || 'matches_service_db',
  entities: [Match, MatchEvent, MatchStats],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  charset: 'utf8mb4',
  timezone: '+00:00',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
