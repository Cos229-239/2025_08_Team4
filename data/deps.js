import { databases, ID, Query } from "../lib/appwrite";
import { DB_ID, COL } from "../lib/ids";
import { ownerPerms } from "../lib/perms";

export async function createDependency(userId, { taskId, dependsOnId, type="finish_to_start", lagMinutes=0 }) {
  const doc = { ownerId: userId, task: taskId, taskId, dependsOn: dependsOnId, dependsOnId, type, lagMinutes };
  return databases.createDocument(DB_ID, COL.DEPS, ID.unique(), doc, ownerPerms(userId));
}

export async function listDependenciesOfTask(userId, taskId) {
  return databases.listDocuments(DB_ID, COL.DEPS, [
    Query.equal("ownerId", userId),
    Query.equal("taskId", taskId),
    Query.limit(1000),
  ]);
}

export async function listDependentsOfTask(userId, taskId) {
  return databases.listDocuments(DB_ID, COL.DEPS, [
    Query.equal("ownerId", userId),
    Query.equal("dependsOnId", taskId),
    Query.limit(1000),
  ]);
}
