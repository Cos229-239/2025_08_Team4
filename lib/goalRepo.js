// app/lib/goalRepo.js
import { databases, ID, Query } from "./appwrite";
import { DB_ID, COL } from "./ids";            // e.g. COL.GOALS, COL.PROFILES
import { ownerPerms } from "./perms";          // you already use this in profile.js
import { getOrCreateProfile } from "./profile"; // <-- pull ownerId from user profile

/** Convenience: load my profile and return its ownerId */
async function getOwnerIdFromProfile() {
  const prof = await getOrCreateProfile();     // creates on first run
  return prof.ownerId;                         // canonical owner id
}

/** Read one goal */
export function getGoal(goalId) {
  return databases.getDocument(DB_ID, COL.GOALS, goalId);
}

/** List my goals (optionally by status) using profile.ownerId */
export async function listMyGoals({ status } = {}) {
  const ownerId = await getOwnerIdFromProfile();
  const q = [Query.equal("ownerId", ownerId), Query.orderDesc("$updatedAt")];
  if (status) q.push(Query.equal("status", status));
  const res = await databases.listDocuments(DB_ID, COL.GOALS, q);
  return res.documents;
}

/** Create or update a goal. ownerId always comes from profile. */
export async function upsertGoal(payload) {
  const ownerId = await getOwnerIdFromProfile();

  // normalize inputs to your schema
  const data = {
    title: (payload.title || "").trim(),
    description: payload.description ?? "",
    why: payload.why ?? "",
    notes: payload.notes ?? "",
    successCriteria: (payload.successCriteria || "").trim(),
    priority: Math.max(0, Math.min(5, Math.round(Number(payload.priority) || 0))),
    targetDate: (payload.targetDate || "").trim(),          // "YYYY-MM-DD"
    timeBudgetMin:
      payload.timeBudgetMin === "" || payload.timeBudgetMin == null
        ? null
        : parseInt(payload.timeBudgetMin, 10),
    status: payload.status || "not_started",
    reviewCadence: payload.reviewCadence ?? "",
    project: payload.project ?? "",
    projectId: payload.projectId ?? "",
    ownerId,                                                // <-- from profile, not UI
  };

  if (payload.$id) {
    // update existing
    return databases.updateDocument(DB_ID, COL.GOALS, payload.$id, data);
  } else {
    // create new with owner-only permissions
    return databases.createDocument(
      DB_ID,
      COL.GOALS,
      ID.unique(),
      data,
      ownerPerms(ownerId)                                   // reuse your helper
    );
  }
}

/** Delete a goal */
export function deleteGoal(goalId) {
  return databases.deleteDocument(DB_ID, COL.GOALS, goalId);
}
