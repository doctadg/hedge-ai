import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
    let client;
  try {

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    try {
        client = await pool.connect()
    } catch (error) {
        console.log("Error connecting")
        console.error('Error connecting to the database:', error);
        return
    }

    try {
      await client.query(schemaSql);
      console.log('Database schema initialized successfully.');
    } catch (error) {
      console.error('Error initializing database schema:', error);
    } finally {
        if (client) {
            client.release();
        }
    }
  } catch (err) {
    console.error('Error setting up database', err)
  } finally {
    await pool.end()
  }
}

setupDatabase();
