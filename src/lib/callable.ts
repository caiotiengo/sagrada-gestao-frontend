import { httpsCallable, type HttpsCallableResult } from 'firebase/functions'
import { functions, auth } from './firebase'
import { trackError } from './analytics'

/**
 * Refresh Firebase ID token and retry once on auth errors.
 */
async function withTokenRefresh<T>(attempt: () => Promise<T>): Promise<T> {
  try {
    return await attempt()
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code
    if (
      code === 'functions/unauthenticated' ||
      code === 'functions/permission-denied'
    ) {
      // Force-refresh the token and retry once
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true)
        return await attempt()
      }
    }
    throw error
  }
}

/**
 * Helper to call Firebase Cloud Functions with typed request/response.
 * Wraps httpsCallable with proper typing.
 * Automatically retries once with a fresh token on auth errors.
 */
export async function callFunction<TRequest, TResponse>(
  name: string,
  data: TRequest
): Promise<TResponse> {
  try {
    const fn = httpsCallable<TRequest, { success: true; data: TResponse }>(functions, name)
    const result = await withTokenRefresh(async () => {
      const r: HttpsCallableResult<{ success: true; data: TResponse }> = await fn(data)
      return r
    })
    return result.data.data
  } catch (error: unknown) {
    const message = (error as { message?: string })?.message || 'Unknown error'
    trackError(message, `callable:${name}`)
    throw error
  }
}

/**
 * For functions that return a simple message/status (no nested data).
 */
export async function callFunctionRaw<TRequest, TResponse>(
  name: string,
  data: TRequest
): Promise<TResponse> {
  const fn = httpsCallable<TRequest, TResponse>(functions, name)
  const result = await withTokenRefresh(() => fn(data))
  return result.data
}
