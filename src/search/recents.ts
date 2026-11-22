import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

const PREFIX = 'recent-searches:';
const MAX = 10; // keep the newest 10

// one list per account, so switching accounts on a phone never mixes them
const key = (userId: string) => `${PREFIX}${userId}`;

async function save(userId: string, list: RecentProfile[]) {
  try {
    await AsyncStorage.setItem(key(userId), JSON.stringify(list));
  } catch (e) {
    console.log('Could not save recent searches:', e);
  }
}

export async function loadRecents(userId: string): Promise<RecentProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as RecentProfile[]) : [];
  } catch {
    return [];
  }
}

// moves the person to the top if they're already there
export async function addRecent(userId: string, person: RecentProfile): Promise<RecentProfile[]> {
  const current = await loadRecents(userId);
  const next = [person, ...current.filter((p) => p.id !== person.id)].slice(0, MAX);
  await save(userId, next);
  return next;
}

export async function removeRecent(userId: string, personId: string): Promise<RecentProfile[]> {
  const next = (await loadRecents(userId)).filter((p) => p.id !== personId);
  await save(userId, next);
  return next;
}

export async function clearRecents(userId: string) {
  try {
    await AsyncStorage.removeItem(key(userId));
  } catch (e) {
    console.log('Could not clear recent searches:', e);
  }
}

// call on log out
export async function clearAllRecents() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith(PREFIX)));
  } catch (e) {
    console.log('Could not clear recent searches:', e);
  }
}