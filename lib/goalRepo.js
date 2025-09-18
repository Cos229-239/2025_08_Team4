import { databases, ID, Query } from "./appwrite";
import { DB_ID, COL } from "./ids";            
import { ownerPerms } from "./perms";          
import { getOrCreateProfile } from "./profile"; 


async function getOwnerIdFromProfile() {
  const prof = await getOrCreateProfile();     
  return prof.ownerId;                        
}


export function getGoal(goalId) {
  return databases.getDocument(DB_ID, COL.GOALS, goalId);
}


export async function listMyGoals({ status } = {}) {
  const ownerId = await getOwnerIdFromProfile();
  const q = [Query.equal("ownerId", ownerId), Query.orderDesc("$updatedAt")];
  if (status) q.push(Query.equal("status", status));
  const res = await databases.listDocuments(DB_ID, COL.GOALS, q);
  return res.documents;
}


export async function upsertGoal(payload) {
  const ownerId = await getOwnerIdFromProfile();

  
  const data = {
    title: (payload.title || "").trim(),
    description: payload.description ?? "",
    why: payload.why ?? "",
    notes: payload.notes ?? "",
    successCriteria: (payload.successCriteria || "").trim(),
    priority: Math.max(0, Math.min(5, Math.round(Number(payload.priority) || 0))),
    targetDate: (payload.targetDate || "").trim(),         
    timeBudgetMin:
      payload.timeBudgetMin === "" || payload.timeBudgetMin == null
        ? null
        : parseInt(payload.timeBudgetMin, 10),
    status: payload.status || "not_started",
    reviewCadence: payload.reviewCadence ?? "",
    project: payload.project ?? "",
    projectId: payload.projectId ?? "",
    ownerId,                                               
  };


  if (payload.$id) {
    
    return databases.updateDocument(DB_ID, COL.GOALS, payload.$id, data);
  } else {
    
    return databases.createDocument(
      DB_ID,
      COL.GOALS,
      ID.unique(),
      data,
      ownerPerms(ownerId)                                  
    );
  }
}


export function deleteGoal(goalId) {
  return databases.deleteDocument(DB_ID, COL.GOALS, goalId);
}
