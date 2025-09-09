
import { account, databases, ID, Query } from './appwrite';
import { DB_ID, COL } from './ids';
import { ownerPerms } from './perms';

export const BARRIER_LABEL_TO_CODE = {
  'Lack of Motivation': 'LM',
  'Time Management Issues': 'TMI',
  'Fear of Failure': 'FOF',
  'Lack of Clear Goals': 'LOCG',
  'Procrastination': 'P',
  'Self-Doubt': 'SD',
  'Distractions': 'D',
  'Overwhelming': 'O',
};
const BARRIER_CODES = new Set(Object.values(BARRIER_LABEL_TO_CODE));
const PRONOUNS = ['she/her', 'he/him', 'they/them', 'other'];

function normalizeBarriers(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => {
      if (!v) return null;
      if (BARRIER_LABEL_TO_CODE[v]) return BARRIER_LABEL_TO_CODE[v]; 
      const s = String(v).trim().toUpperCase();
      return BARRIER_CODES.has(s) ? s : null;
    })
    .filter(Boolean);
}

function normalizePronouns(v) {
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  return PRONOUNS.includes(s) ? s : undefined;
}


export async function getCurrentUser() {
  return account.get();
}


export async function getProfileFor(ownerId) {

  const res = await databases.listDocuments(DB_ID, COL.PROFILES, [
    Query.equal('ownerId', ownerId),
    Query.limit(1),
  ]);
  const doc = res.documents[0] || null;

  return doc;
}

export async function getOrCreateProfile() {
  const me = await getCurrentUser();
  const ownerId = me.$id;

  const existing = await getProfileFor(ownerId);
  if (existing) return existing;

  const created = await databases.createDocument(
    DB_ID,
    COL.PROFILES,
    ID.unique(),
    {
      ownerId,
      email: me.email ?? '',
      name: '',
      language: '',
      pronouns: '',            
      country: '',
      timeSpentMonthly: null,  
      timeGoalMonthly: null,   
      reminderFrequency: null, 
      barriers: [],
      onboardingCompleted: !!me.prefs?.onboardingCompleted, 
    },
    ownerPerms(ownerId)
  );

  return created;
}


export async function updateProfile(partial) {
  const me = await getCurrentUser();
  const ownerId = me.$id;
  const prof = (await getProfileFor(ownerId)) ?? (await getOrCreateProfile());


  const allowed = {
    name: true,
    language: true,
    pronouns: true,
    country: true,
    timeSpentMonthly: true,
    timeGoalMonthly: true,
    reminderFrequency: true,
    onboardingCompleted: true,
    barriers: true,
    email: true,
  };

  const body = {};
  for (const [k, v] of Object.entries(partial || {})) {
    if (!allowed[k]) continue;

    if (k === 'barriers') {
      body.barriers = normalizeBarriers(v);
      continue;
    }
    if (k === 'pronouns') {
      const p = normalizePronouns(v);
      if (p !== undefined) body.pronouns = p;
      continue;
    }
    if (k === 'name' || k === 'language' || k === 'country' || k === 'email') {
      body[k] = typeof v === 'string' ? v.trim() : v;
      continue;
    }

    body[k] = v;
  }

  if (Object.keys(body).length === 0) {
    return prof;
  }

  const updated = await databases.updateDocument(DB_ID, COL.PROFILES, prof.$id, body);

  return updated;
}


export async function fetchMyProfile() {
  const me = await getCurrentUser();
  return getProfileFor(me.$id);
}
