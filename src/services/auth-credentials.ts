const STORAGE_KEY = 'cms.auth'

export interface StoredCredentials {
  username: string
  password: string
  remember: boolean
}

function parseCredentials(raw: string | null): StoredCredentials | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredCredentials
    if (!parsed?.username || typeof parsed.password !== 'string') return null
    return {
      username: parsed.username,
      password: parsed.password,
      remember: parsed.remember === true,
    }
  } catch {
    return null
  }
}

export function getStoredCredentials(): StoredCredentials | null {
  return parseCredentials(localStorage.getItem(STORAGE_KEY))
    ?? parseCredentials(sessionStorage.getItem(STORAGE_KEY))
}

export function setStoredCredentials(creds: StoredCredentials): void {
  clearStoredCredentials()
  const json = JSON.stringify(creds)
  if (creds.remember) {
    localStorage.setItem(STORAGE_KEY, json)
  } else {
    sessionStorage.setItem(STORAGE_KEY, json)
  }
}

export function clearStoredCredentials(): void {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(STORAGE_KEY)
}

export function toBasicAuthHeader(username: string, password: string): string {
  return `Basic ${btoa(`${username}:${password}`)}`
}
