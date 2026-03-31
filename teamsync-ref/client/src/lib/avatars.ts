const DICEBEAR_BASE = "https://api.dicebear.com/9.x";

export function getPersonAvatar(seed: string, size = 32): string {
  return `${DICEBEAR_BASE}/micah/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
}

export function getThingAvatar(seed: string, size = 32): string {
  return `${DICEBEAR_BASE}/glass/svg?seed=${encodeURIComponent(seed)}&size=${size}`;
}
