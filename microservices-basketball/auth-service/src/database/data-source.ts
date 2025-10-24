import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config({ path: '.env.development' });

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'OAuth',
  password: process.env.DB_PASSWORD || 'OAuth1234@',
  database: process.env.DB_DATABASE || 'auth_service_db',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
