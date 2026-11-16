/**
 * Mensagens de erro das callables.
 *
 * O backend lança HttpsError com mensagens em português pensadas para o usuário
 * ("Só o caixa da casa pode registrar...", "Você já faz parte desta casa...").
 * Os toasts devem mostrar essa mensagem; o texto genérico fica só como
 * fallback para erros internos/de rede.
 */

const GENERIC_CODES = new Set([
  'functions/internal',
  'functions/unknown',
  'functions/unavailable',
  'functions/deadline-exceeded',
  'functions/cancelled',
  'functions/data-loss',
])

const VALIDATION_PREFIX = 'Dados inválidos: '

/** Erros do Firebase Auth que valem uma mensagem específica. */
const AUTH_MESSAGES: Record<string, string> = {
  'auth/weak-password': 'Senha fraca: use pelo menos 8 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos e tente de novo.',
  'auth/network-request-failed': 'Sem conexão. Verifique a internet e tente de novo.',
}

interface MaybeFirebaseError {
  code?: string
  message?: string
}

function parseValidationIssues(message: string): Array<{ path: string; message: string }> {
  return message
    .slice(VALIDATION_PREFIX.length)
    .split('; ')
    .map((issue) => {
      const idx = issue.indexOf(': ')
      if (idx === -1) return { path: '', message: issue }
      return { path: issue.slice(0, idx), message: issue.slice(idx + 2) }
    })
}

/** Mensagem para o usuário a partir de um erro de callable. */
export function getErrorMessage(error: unknown, fallback: string): string {
  const err = (error ?? {}) as MaybeFirebaseError
  const code = err.code ?? ''
  const message = (err.message ?? '').trim()
  if (AUTH_MESSAGES[code]) return AUTH_MESSAGES[code]
  if (!code.startsWith('functions/')) return fallback
  if (GENERIC_CODES.has(code) || !message || message.toLowerCase() === code.replace('functions/', '')) {
    return fallback
  }
  if (message.startsWith(VALIDATION_PREFIX)) {
    const issues = parseValidationIssues(message)
    return issues.map((i) => i.message).join('; ') || fallback
  }
  return message
}

/**
 * Erros de validação por campo ("subdomain" -> "Subdomínio inválido").
 * Vazio quando o erro não é de validação do back.
 */
export function getErrorFields(error: unknown): Record<string, string> {
  const err = (error ?? {}) as MaybeFirebaseError
  const message = err.message ?? ''
  if (err.code !== 'functions/invalid-argument' || !message.startsWith(VALIDATION_PREFIX)) return {}
  const fields: Record<string, string> = {}
  for (const issue of parseValidationIssues(message)) {
    if (issue.path && !fields[issue.path]) fields[issue.path] = issue.message
  }
  return fields
}

export function getErrorCode(error: unknown): string {
  return ((error ?? {}) as MaybeFirebaseError).code ?? ''
}
