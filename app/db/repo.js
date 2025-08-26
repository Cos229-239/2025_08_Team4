import { useSQLiteContext } from "expo-sqlite";

const uid = () => Math.random().toString(36).slice(2, 10);

export function useRepo() {
  const db = useSQLiteContext();

  // ----- GOALS -----
  const listGoals = async () => {
    return await db.getAllAsync(`SELECT * FROM goals ORDER BY createdAt DESC`);
  };

  const getGoal = async (id) => {
    return await db.getFirstAsync(`SELECT * FROM goals WHERE id = ?`, [id]);
  };

  const createGoal = async ({ title, description = null, dueAt = null, status = "not_started", priority = null }) => {
    const id = uid();
    await db.runAsync(
      `INSERT INTO goals (id, title, description, createdAt, dueAt, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, Date.now(), dueAt, status, priority]
    );
    return id;
  };

  const updateGoal = async (id, patch) => {
    const keys = Object.keys(patch);
    if (!keys.length) return;
    const sets = keys.map((k) => `${k} = ?`).join(", ");
    const vals = keys.map((k) => patch[k] ?? null);
    await db.runAsync(`UPDATE goals SET ${sets} WHERE id = ?`, [...vals, id]);
  };

  const deleteGoal = async (id) => {
    await db.runAsync(`DELETE FROM goals WHERE id = ?`, [id]); // cascades tasks
  };

  // ----- TASKS -----
  const listTasksForGoal = async (goalId) => {
    return await db.getAllAsync(`SELECT * FROM tasks WHERE goalId = ? ORDER BY createdAt DESC`, [goalId]);
  };

  const createTask = async ({ goalId, title, notes = null, dueAt = null, done = false }) => {
    const id = uid();
    await db.runAsync(
      `INSERT INTO tasks (id, goalId, title, notes, createdAt, dueAt, done)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, goalId, title, notes, Date.now(), dueAt, done ? 1 : 0]
    );
    return id;
  };

  const setTaskDone = async (id, done) => {
    await db.runAsync(`UPDATE tasks SET done = ? WHERE id = ?`, [done ? 1 : 0, id]);
  };

  const deleteTask = async (id) => {
    await db.runAsync(`DELETE FROM tasks WHERE id = ?`, [id]);
  };

  // ----- Dependencies (optional) -----
  const addDependency = async (taskId, dependsOnId) => {
    await db.runAsync(
      `INSERT OR IGNORE INTO task_dependencies (taskId, dependsOnId) VALUES (?, ?)`,
      [taskId, dependsOnId]
    );
  };

  const removeDependency = async (taskId, dependsOnId) => {
    await db.runAsync(
      `DELETE FROM task_dependencies WHERE taskId = ? AND dependsOnId = ?`,
      [taskId, dependsOnId]
    );
  };

  const overdueUnblockedTasks = async () => {
    return await db.getAllAsync(
      `
      SELECT t.*
      FROM tasks t
      WHERE t.dueAt IS NOT NULL
        AND t.dueAt < ?
        AND t.done = 0
        AND NOT EXISTS (
          SELECT 1
          FROM task_dependencies d
          JOIN tasks dep ON dep.id = d.dependsOnId
          WHERE d.taskId = t.id AND dep.done = 0
        )
      ORDER BY t.dueAt ASC
      `,
      [Date.now()]
    );
  };

  return {
    // goals
    listGoals, getGoal, createGoal, updateGoal, deleteGoal,
    // tasks
    listTasksForGoal, createTask, setTaskDone, deleteTask,
    // deps / examples
    addDependency, removeDependency, overdueUnblockedTasks,
  };
}
