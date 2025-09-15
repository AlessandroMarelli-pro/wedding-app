import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    const databaseUrl = this.configService.get<string>('DATABASE_URL');

    // Determine database type based on environment
    const dbType = databaseUrl?.startsWith('postgres') ? 'postgres' : 'sqlite';

    const baseConfig = {
      entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      synchronize: !isProduction, // Only for development
      logging: process.env.NODE_ENV === 'development',
      migrationsRun: false, // We'll run migrations manually
    };

    if (dbType === 'postgres') {
      return {
        ...baseConfig,
        type: 'postgres',
        url: databaseUrl,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      };
    } else {
      return {
        ...baseConfig,
        type: 'sqlite',
        database: databaseUrl || 'wedding.db',
      };
    }
  }
}

// DataSource for migrations - single default export required by TypeORM CLI
const databaseUrl = process.env.DATABASE_URL || 'wedding.db';
const isPostgres = databaseUrl.startsWith('postgres');

const AppDataSource = new DataSource({
  type: isPostgres ? 'postgres' : 'sqlite',
  ...(isPostgres
    ? {
        url: databaseUrl,
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        database: databaseUrl,
      }),
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
} as DataSourceOptions);

export default AppDataSource;
