// lib/projectRepo.js
import { databases, account, ID, Query } from "./appwrite";
import { DB_ID, COL, ENUMS } from "./ids";
import { ownerPerms } from "./perms";

/** Canonical enum values (from ids.js) */
export const PROJECT_TYPE_ENUM = ENUMS.PROJECT_TYPES;

/** Case-insensitive validator → returns the canonical enum value or throws */
export function normalizeProjectType(input) {
  if (!input) throw new Error("Project type is required.");
  const s = String(input).trim();
  const hit = PROJECT_TYPE_ENUM.find(v => v.toLowerCase() === s.toLowerCase());
  if (!hit) throw new Error(`Invalid project type: "${input}". Allowed: ${PROJECT_TYPE_ENUM.join(", ")}`);
  return hit;
}

export const isValidProjectType = (input) =>
  !!PROJECT_TYPE_ENUM.find(v => v.toLowerCase() === String(input || "").trim().toLowerCase());

export async function createProject({
  name,
  type,
  description = "",
  color = "",
  parentId = null,
}) {
  if (!DB_ID) throw new Error("Missing DB_ID (set in lib/ids.js).");
  if (!COL?.PROJECTS) throw new Error("Missing COL.PROJECTS (set in lib/ids.js).");

  if (!name?.trim()) throw new Error("Project name is required.");
  if (name.length > 120) throw new Error("Name must be ≤ 120 characters.");
  if (description?.length > 2000) throw new Error("Description must be ≤ 2000 characters.");
  if (color && color.length > 32) throw new Error("Color must be ≤ 32 characters (e.g., #37C6AD).");
  if (parentId && parentId.length > 36) throw new Error("parentId must be ≤ 36 characters.");

  const typeCanonical = normalizeProjectType(type);

  const me = await account.get();
  const ownerId = me.$id;

  const data = {
    name: name.trim(),
    description: description?.trim() || "",
    color: color?.trim() || "",
    parentId: parentId || null,
    type: typeCanonical,   // stored exactly as enum
    ownerId,
  };

  const permissions = ownerPerms(ownerId);

  return databases.createDocument(DB_ID, COL.PROJECTS, ID.unique(), data, permissions);
}

export async function listMyProjects(limit = 100) {
  if (!DB_ID || !COL?.PROJECTS) throw new Error("Missing DB_ID or COL.PROJECTS.");
  const me = await account.get();
  const res = await databases.listDocuments(DB_ID, COL.PROJECTS, [
    Query.equal("ownerId", me.$id),
    Query.orderDesc("$updatedAt"),
    Query.limit(limit),
  ]);
  return res.documents || [];
}
