#!/usr/bin/env node

/**
 * SQLite to PostgreSQL Migration Script
 * This script helps migrate data from SQLite to PostgreSQL
 */

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const sqlite3 = require("sqlite3").verbose();

// Configuration
const SQLITE_DB_PATH = process.env.SQLITE_DB_PATH || "./wedding.db";
const POSTGRES_URL = process.env.DATABASE_URL;

if (!POSTGRES_URL) {
  console.error("❌ DATABASE_URL environment variable is required");
  process.exit(1);
}

// Initialize clients
const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
const postgresClient = new Client({ connectionString: POSTGRES_URL });

// Tables to migrate (in dependency order)
const TABLES = [
  "admin",
  "wedding_info",
  "accommodation",
  "guest",
  "program_event",
  "rsvp_confirmation",
  "csv_upload",
  "uploaded_image",
];

async function connectDatabases() {
  try {
    await postgresClient.connect();
    console.log("✅ Connected to PostgreSQL");

    // Check if SQLite database exists
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      throw new Error(`SQLite database not found at: ${SQLITE_DB_PATH}`);
    }
    console.log("✅ SQLite database found");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}

async function getTableData(tableName) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

async function insertDataToPostgres(tableName, data) {
  if (data.length === 0) {
    console.log(`⏭️  No data to migrate for table: ${tableName}`);
    return;
  }

  const columns = Object.keys(data[0]);
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const query = `INSERT INTO ${tableName} (${columns.join(
    ", "
  )}) VALUES (${placeholders})`;

  for (const row of data) {
    const values = columns.map((col) => row[col]);
    try {
      await postgresClient.query(query, values);
    } catch (error) {
      console.error(
        `❌ Error inserting data into ${tableName}:`,
        error.message
      );
      throw error;
    }
  }

  console.log(`✅ Migrated ${data.length} rows to ${tableName}`);
}

async function migrateTable(tableName) {
  try {
    console.log(`🔄 Migrating table: ${tableName}`);

    // Check if table exists in SQLite
    const tableExists = await new Promise((resolve) => {
      sqliteDb.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
        [tableName],
        (err, row) => resolve(!!row)
      );
    });

    if (!tableExists) {
      console.log(`⏭️  Table ${tableName} does not exist in SQLite, skipping`);
      return;
    }

    const data = await getTableData(tableName);
    await insertDataToPostgres(tableName, data);
  } catch (error) {
    console.error(`❌ Failed to migrate table ${tableName}:`, error.message);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log("🚀 Starting SQLite to PostgreSQL migration...");

    await connectDatabases();

    // Run migrations first to ensure tables exist
    console.log("🔄 Running PostgreSQL migrations...");
    // Note: You'll need to run migrations separately using: npm run migration:run

    // Migrate each table
    for (const table of TABLES) {
      await migrateTable(table);
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    await postgresClient.end();
    sqliteDb.close();
  }
}

// Run the migration
runMigration();
