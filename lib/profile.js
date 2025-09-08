// lib/profile.js
import { account, databases, ID, Query } from './appwrite';
import { DB_ID, COL } from './ids';
import { ownerPerms } from './perms';

// Appwrite enum codes for barriers
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
      if (BARRIER_LABEL_TO_CODE[v]) return BARRIER_LABEL_TO_CODE[v]; // label -> code
      const s = String(v).trim().toUpperCase();
      return BARRIER_CODES.has(s) ? s : null;
    })
    .filter(Boolean);
}

function normalizePronouns(v) {
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  return PRONOUNS.includes(s) ? s : undefined; // undefined => omitted from payload
}

export async function getCurrentUser() {
  return account.get();
}

export async function getProfileFor(userId) {
  const res = await databases.listDocuments(DB_ID, COL.PROFILES, [
    Query.equal('ownerId', userId),
    Query.limit(1),
  ]);
  return res.documents[0] || null;
}

export async function getOrCreateProfile() {
  const me = await getCurrentUser();
  const userId = me.$id;
  const existing = await getProfileFor(userId);
  if (existing) return existing;

  // Create with only safe defaults—do not set enum fields to invalid placeholders
  return databases.createDocument(
    DB_ID,
    COL.PROFILES,
    ID.unique(),
    {
      ownerId: userId,
      email: me.email ?? '',
      name: '',
      language: '',
      country: '',
      barriers: [],
      onboardingCompleted: !!me.prefs?.onboardingCompleted,
      // pronouns, timeSpentMonthly, timeGoalMonthly, reminderFrequency are omitted until chosen
    },
    ownerPerms(userId)
  );
}

export async function updateProfile(partial) {
  const me = await getCurrentUser();
  const userId = me.$id;
  const prof = (await getProfileFor(userId)) ?? (await getOrCreateProfile());

  // Accept only whitelisted fields; coerce/rename where needed
  const body = {};
  if (typeof partial?.name === 'string') body.name = partial.name.trim();
  if (typeof partial?.language === 'string') body.language = partial.language.trim();
  if (typeof partial?.country === 'string') body.country = partial.country.trim();

  if ('pronouns' in partial) {
    const p = normalizePronouns(partial.pronouns);
    if (p !== undefined) body.pronouns = p; // omit if invalid/empty
  }

  if ('barriers' in partial) body.barriers = normalizeBarriers(partial.barriers);

  // support both "Month" (old) and "Monthly" (schema) keys
  if (partial?.timeSpentMonthly) body.timeSpentMonthly = partial.timeSpentMonthly;
  if (partial?.timeSpentMonth) body.timeSpentMonthly = partial.timeSpentMonth;

  if (partial?.timeGoalMonthly) body.timeGoalMonthly = partial.timeGoalMonthly;
  if (partial?.timeGoalMonth) body.timeGoalMonthly = partial.timeGoalMonth;

  if (partial?.reminderFrequency) body.reminderFrequency = partial.reminderFrequency;

  if (typeof partial?.onboardingCompleted === 'boolean') {
    body.onboardingCompleted = partial.onboardingCompleted;
  }

  if (Object.keys(body).length === 0) return prof; // nothing valid to update

  return databases.updateDocument(DB_ID, COL.PROFILES, prof.$id, body);
}
