import { USER_STORAGE_KEY } from '@/constants'

export const AUTHED_ATTR = 'data-sg-authed'

/**
 * Roda antes da pintura: se há perfil salvo neste navegador, marca o <html>
 * e o CSS esconde a landing e mostra o carregando. Quem está logado não vê a
 * landing piscar antes de ir para a área dele.
 */
export const LANDING_PRE_PAINT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(
  USER_STORAGE_KEY,
)})||'null');if(p&&p.houses&&p.houses.length)document.documentElement.setAttribute('${AUTHED_ATTR}','')}catch(e){}`

