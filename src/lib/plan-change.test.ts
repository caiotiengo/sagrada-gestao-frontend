// Testes da explicação da troca de plano: `npm test` (node --test, sem dependências).
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { planChangeExplanation, planChangeKind, type PlanChangeInput } from './plan-change.ts'

const base: PlanChangeInput = { currentPlan: 'casa', currentInterval: 'month', targetPlan: 'casa-grande', targetInterval: 'month', planOrder: ['casa', 'casa-grande'], status: 'active', billingMode: 'stripe' }
const texts = { targetName: 'Casa Grande', currentName: 'Casa', targetPrice: 'R$ 54,90/mês', trialEnd: '01/12/2026', periodEnd: '15/12/2026', targetLimit: null, activeMembers: 30 }

describe('planChangeKind', () => {
  it('mesmo plano e período: nada', () => assert.equal(planChangeKind({ ...base, targetPlan: 'casa' }), 'none'))
  it('no teste do Stripe: trial', () => assert.equal(planChangeKind({ ...base, status: 'trialing' }), 'trial'))
  it('plano maior: upgrade', () => assert.equal(planChangeKind(base), 'upgrade'))
  it('mensal → anual no mesmo plano: upgrade', () => assert.equal(planChangeKind({ ...base, targetPlan: 'casa', targetInterval: 'year' }), 'upgrade'))
  it('plano menor: downgrade', () => assert.equal(planChangeKind({ ...base, currentPlan: 'casa-grande', currentInterval: 'year', targetPlan: 'casa', targetInterval: 'year' }), 'downgrade'))
  it('Casa Grande mensal → Casa anual: downgrade (plano vem primeiro)', () => assert.equal(planChangeKind({ ...base, currentPlan: 'casa-grande', targetPlan: 'casa', targetInterval: 'year' }), 'downgrade'))
  it('PIX: vale no próximo período', () => assert.equal(planChangeKind({ ...base, billingMode: 'pix' }), 'pix'))
})

describe('planChangeExplanation', () => {
  it('no teste: "seus dias grátis continuam"', () => {
    const t = planChangeExplanation('trial', texts).join(' ')
    assert.match(t, /seus dias grátis continuam/)
    assert.match(t, /01\/12\/2026/)
  })
  it('upgrade cobra a diferença na hora', () => assert.match(planChangeExplanation('upgrade', texts).join(' '), /cobrada na hora/))
  it('downgrade no fim do período', () => assert.match(planChangeExplanation('downgrade', { ...texts, targetName: 'Casa', currentName: 'Casa Grande' }).join(' '), /a partir de 15\/12\/2026/))
  it('PIX no próximo pagamento', () => assert.match(planChangeExplanation('pix', texts).join(' '), /próximo pagamento por PIX/))
  it('acima do limite avisa', () => assert.match(planChangeExplanation('downgrade', { ...texts, targetName: 'Casa', targetLimit: 100, activeMembers: 101 }).join(' '), /101 pessoas ativas/))
})
