export type UserIdentity = {
  name: string;
  contact?: string;
  contactType?: string;
  avatarUrl?: string;
  participantId: string;
};

const STORAGE_KEY = "blueprint-identity";

export function getIdentity(): UserIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.name && parsed?.participantId) return parsed as UserIdentity;
    return null;
  } catch {
    return null;
  }
}

export function saveIdentity(identity: UserIdentity): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function clearIdentity(): void {
  localStorage.removeItem(STORAGE_KEY);
}
