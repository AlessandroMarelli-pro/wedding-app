require('dotenv').config({ path: './.env' });
const { Client } = require('pg');

async function createDatabase() {
  // Parse DATABASE_URL or use individual components
  let connectionConfig;

  if (process.env.DATABASE_URL) {
    // Extract components from DATABASE_URL
    const url = new URL(process.env.DATABASE_URL);
    connectionConfig = {
      user: url.username,
      host: url.hostname,
      database: 'postgres', // Connect to default postgres database to create new one
      password: url.password,
      port: parseInt(url.port) || 5432,
    };
  } else {
    // Use individual environment variables
    connectionConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'postgres', // Connect to default postgres database to create new one
      password: process.env.DB_PASSWORD || 'password',
      port: parseInt(process.env.DB_PORT || '5432'),
    };
  }

  const dbName = process.env.DATABASE_URL
    ? new URL(process.env.DATABASE_URL).pathname.slice(1)
    : process.env.DB_NAME || 'wedding_db';

  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log('🔗 Connected to PostgreSQL server');

    // Check if database exists
    const checkDbQuery = `
        SELECT 1 FROM pg_database WHERE datname = $1
      `;

    const result = await client.query(checkDbQuery, [dbName]);

    if (result.rows.length === 0) {
      console.log(`Creating database: ${dbName}`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database ${dbName} created successfully.`);
    } else {
      console.log(`ℹ️  Database ${dbName} already exists.`);
    }
  } catch (error) {
    console.error('❌ Database creation error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log(
        '\n❌ Connection refused. Please ensure PostgreSQL is running.',
      );
      console.log('To start PostgreSQL:');
      console.log('  - macOS: brew services start postgresql');
      console.log('  - Linux: sudo systemctl start postgresql');
      console.log('  - Windows: Start PostgreSQL service');
    } else if (error.code === '28P01') {
      console.log('\n❌ Authentication failed. Please check your credentials.');
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
