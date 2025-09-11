import { databases, ID } from "../lib/appwrite";
import { DB_ID, COL } from "../lib/ids";
import { ownerPerms } from "../lib/perms";

import { useUserId } from '../hooks/useUserId';
import { ownerPerms } from '../lib/perms';


export async function createTask(userId, task) {
  const userId = useUserId();
  const doc = {
    ownerId: userId,
    title: task.title,
    notes: task.notes ?? "",
    status: task.status ?? "todo",
    priority: task.priority ?? 1,
    estimateMinutes: task.estimateMinutes ?? null,
    energy: task.energy ?? "med",
    startDate: task.startDate ?? null,
    dueDate: task.dueDate ?? null,
    scheduledFor: task.scheduledFor ?? null,
    snoozeUntil: task.snoozeUntil ?? null,
    goal: task.goal ?? null,                 // relationship
    goalId: task.goalId ?? task.goal ?? null // string for index not shown just tracked
  };
  
  return databases.createDocument(DB_ID, COL.TASKS, ID.unique(), doc, ownerPerms(userId));
}

export async function updateTask(taskId, patch) {
  return databases.updateDocument(DB_ID, COL.TASKS, taskId, patch);
}

export async function deleteTask(taskId) {
  return databases.deleteDocument(DB_ID, COL.TASKS, taskId);
}
