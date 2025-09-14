import { databases, Query } from "../lib/appwrite";
import { DB_ID, COL } from "../lib/ids";

export async function listCandidateTasks(userId, limit=200) {
  return databases.listDocuments(DB_ID, COL.TASKS, [
    Query.equal("ownerId", userId),
    Query.contains("status", ["todo","in_progress","waiting","blocked"]),
    Query.orderAsc("scheduledFor"),
    Query.orderAsc("dueDate"),
    Query.limit(limit),
  ]);
}

export async function listAllDepsForOwner(userId, limit=1000) {
  return databases.listDocuments(DB_ID, COL.DEPS, [ Query.equal("ownerId", userId), Query.limit(limit) ]);
}
