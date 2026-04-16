import * as SQLite from "expo-sqlite"; //lokalna baza danych wpisów

const db = SQLite.openDatabaseSync("diary.db");

export const initDiaryDb = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS diary_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      sync_status TEXT DEFAULT 'pending',
      server_id TEXT,
      updated_at TEXT NOT NULL
    );
  `);
};

export default db;
