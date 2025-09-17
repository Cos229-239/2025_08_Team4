import { databases, ID, Query } from "./appwrite";
import { DB_ID, COL } from "./ids";
import { ownerPerms } from "./perms";
import { getOrCreateProfile } from "./profile";

async function getOwnerIdFromProfile() {
  const prof = await getOrCreateProfile();
  return prof.ownerId;
}

export function getTask(taskId) {
  return databases.getDocument(DB_ID, COL.TASKS, taskId);
}

export async function listTasksForGoal(goalId) {
  const q = [Query.equal("goalId", goalId), Query.orderDesc("$createdAt")];
  const res = await databases.listDocuments(DB_ID, COL.TASKS, q);
  return res.documents;
}

export async function upsertTask(payload) {
  const ownerId = await getOwnerIdFromProfile();

  const data = {
    title: (payload.title || "").trim(),
    notes: payload.notes ?? "",
    dueDate: payload.dueDate,
    priority: String(Math.max(0, Math.min(5, Math.round(Number(payload.priority) || 0)))),
    estimateMinutes: 
      payload.estimateMinutes === "" || payload.estimateMinutes == null
        ? null
        : parseInt(payload.estimateMinutes, 10),
    status: payload.status || "paused",
    goalId: payload.goalId,
    ownerId,
    startDate: payload.startDate || new Date().toISOString().split('T')[0],
  };

  if (!data.goalId) {
    throw new Error("Cannot create a task without a goalId.");
  }

  if (payload.$id) {
    return databases.updateDocument(DB_ID, COL.TASKS, payload.$id, data);
  } else {
    return databases.createDocument(
      DB_ID,
      COL.TASKS,
      ID.unique(),
      data,
      ownerPerms(ownerId)
    );
  }
}

export function deleteTask(taskId) {
  return databases.deleteDocument(DB_ID, COL.TASKS, taskId);
}

export async function listTasksByDuration(minutes) {
  const ownerId = await getOrCreateProfile().then(p => p.ownerId);
  const m = parseInt(minutes, 10);
  if (Number.isNaN(m)) throw new Error("Please provide a valid number of minutes.");

  const q = [
    Query.equal("ownerId", ownerId),
    Query.equal("estimateMinutes", m),
    Query.orderDesc("$createdAt"),
  ];
  const res = await databases.listDocuments(DB_ID, COL.TASKS, q);
  return res.documents;
}

// Optional: “up to X minutes”
export async function listTasksUpToDuration(minutes) {
  const ownerId = await getOrCreateProfile().then(p => p.ownerId);
  const m = parseInt(minutes, 10);
  if (Number.isNaN(m)) throw new Error("Please provide a valid number of minutes.");

  const q = [
    Query.equal("ownerId", ownerId),
    Query.lessThanEqual("estimateMinutes", m),
    Query.orderDesc("$createdAt"),
  ];
  const res = await databases.listDocuments(DB_ID, COL.TASKS, q);
  return res.documents;
}