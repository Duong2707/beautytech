// src/data/datasources/local/sqliteStorage.ts
import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Hàm khởi tạo database, chỉ chạy một lần duy nhất
const getDB = () => {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('beautytech_cache.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS storage (
          key TEXT PRIMARY KEY,
          value TEXT
        );
      `);
      return db;
    })();
  }
  return dbPromise;
};

export const sqliteStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const db = await getDB();
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM storage WHERE key = ?', 
        [key]
      );
      return row ? row.value : null;
    } catch (error) {
      console.error('SQLite getItem error:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.runAsync(
        'INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?)', 
        [key, value]
      );
    } catch (error) {
      console.error('SQLite setItem error:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.runAsync('DELETE FROM storage WHERE key = ?', [key]);
    } catch (error) {
      console.error('SQLite removeItem error:', error);
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      const db = await getDB();
      await db.runAsync('DELETE FROM storage');
    } catch (error) {
      console.error('SQLite clear error:', error);
    }
  }
};