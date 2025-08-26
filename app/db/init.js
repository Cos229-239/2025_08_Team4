// Expo SDK 51+ has async sqlite helpers.
// If you're on older SDK, use the callback versions.

export async function initDb(db) {
  // Turn on FKs and create a simple migrations table
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS __migrations (version INTEGER PRIMARY KEY)
  `);

  const row = await db.getFirstAsync(`SELECT COALESCE(MAX(version), 0) AS version FROM __migrations`);
  const currentVersion = row?.version ?? 0;

  if (currentVersion < 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE goals (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          createdAt INTEGER NOT NULL,
          dueAt INTEGER,
          status TEXT NOT NULL,    -- not_started | in_progress | blocked | done
          priority INTEGER
        );

        CREATE TABLE tasks (
          id TEXT PRIMARY KEY,
          goalId TEXT NOT NULL,
          title TEXT NOT NULL,
          notes TEXT,
          createdAt INTEGER NOT NULL,
          dueAt INTEGER,
          done INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE
        );

        CREATE TABLE task_dependencies (
          taskId TEXT NOT NULL,
          dependsOnId TEXT NOT NULL,
          PRIMARY KEY (taskId, dependsOnId),
          FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE,
          FOREIGN KEY (dependsOnId) REFERENCES tasks(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_tasks_goalId ON tasks(goalId);
        CREATE INDEX idx_tasks_dueAt ON tasks(dueAt);
      `);

      await db.runAsync(`INSERT INTO __migrations(version) VALUES (1)`);
    });
  }

  // Add future migrations like:
  // if (currentVersion < 2) { ...; await db.runAsync(`INSERT INTO __migrations(version) VALUES (2)`); }
}
