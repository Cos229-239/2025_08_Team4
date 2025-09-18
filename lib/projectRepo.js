import { databases, ID, Query } from "./appwrite";
import { DB_ID, COL } from "./ids";
import { ownerPerms } from "./perms";
import { getOrCreateProfile } from "./profile";

async function getOwnerIdFromProfile() {
  const prof = await getOrCreateProfile();
  return prof.ownerId;
}

/**
 * 
 * @returns {Promise<Models.Document[]>}
 */
export async function listMyProjects() {
  const ownerId = await getOwnerIdFromProfile();
  const q = [Query.equal("ownerId", ownerId), Query.orderDesc("$createdAt")];
  const res = await databases.listDocuments(DB_ID, COL.PROJECTS, q); 
  return res.documents;
}

/**

 * @param {{name: string, description?: string}} payload
 * @returns {Promise<Models.Document>}
 */
export async function createProject(payload) {
  const ownerId = await getOwnerIdFromProfile();
  const data = {
    name: payload.name,
    description: payload.description || "",
    type: 'Project',
    ownerId,
  };

  return databases.createDocument(
    DB_ID,
    COL.PROJECTS, 
    ID.unique(),
    data,
    ownerPerms(ownerId)
  );
}