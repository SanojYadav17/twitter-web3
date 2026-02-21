const PROFILE_KEY = 'tweeter_profiles';

export function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
  } catch { return {}; }
}

export function getProfile(address) {
  if (!address) return null;
  const profiles = getProfiles();
  return profiles[address.toLowerCase()] || null;
}

export function saveProfileData(address, data) {
  const profiles = getProfiles();
  profiles[address.toLowerCase()] = { ...data, updatedAt: Date.now() };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  return profiles[address.toLowerCase()];
}

export function getDisplayName(address, profiles) {
  if (!address) return '???';
  const key = address.toLowerCase();
  const p = profiles?.[key];
  if (p?.name) return p.name;
  const stored = getProfile(address);
  if (stored?.name) return stored.name;
  return address.slice(0, 6) + '...' + address.slice(-4);
}

export function getProfilePic(address, profiles) {
  if (!address) return null;
  const key = address.toLowerCase();
  const p = profiles?.[key];
  if (p?.profilePic) return p.profilePic;
  const stored = getProfile(address);
  return stored?.profilePic || null;
}

export function shortAddr(address) {
  if (!address) return '???';
  return address.slice(0, 6) + '...' + address.slice(-4);
}
