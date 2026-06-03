const LEGACY_TOKEN_KEY = 'userToken'
const SESSION_TOKEN_KEY = 'sessionToken'

export const getStoredAuthToken = (): string | null => {
  const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY)
  if (sessionToken) return sessionToken

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY)
  if (!legacyToken) return null

  sessionStorage.setItem(SESSION_TOKEN_KEY, legacyToken)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  return legacyToken
}

export const setStoredAuthToken = (token: string | null): void => {
  if (!token) {
    sessionStorage.removeItem(SESSION_TOKEN_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    return
  }

  sessionStorage.setItem(SESSION_TOKEN_KEY, token)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}

export const clearStoredAuthToken = (): void => {
  sessionStorage.removeItem(SESSION_TOKEN_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
}
