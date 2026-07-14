import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

// Enable verbose mode for debugging
const sqlite = sqlite3.verbose();

// Initialize the database connection
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper functions wrapping sqlite3 in Promises
export function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: sqlite3.RunResult, err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

export function dbAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}

export function dbGet<T>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row as T | undefined);
      }
    });
  });
}

export async function initDb(): Promise<void> {
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // SQLite run doesn't run multiple statements by default in some configurations.
    // So we split by semicolon (careful with statements) or use exec.
    await new Promise<void>((resolve, reject) => {
      db.exec(schemaSql, (err) => {
        if (err) {
          console.error('Error executing schema.sql:', err);
          reject(err);
        } else {
          console.log('Database schema initialized successfully.');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

export default db;
