/*
 * REVISÃO JURÍDICA PENDENTE. Termos de uso simples, escritos a partir do que o
 * sistema faz hoje (17/11/2026). Precisa de revisão de advogado(a) antes de
 * publicar; os trechos [A CONFIRMAR: ...] dependem da empresa.
 */
import type { Metadata } from 'next'

import { APP_NAME, ROUTES } from '@/constants'
import { A, H2, LegalPage, ToConfirm, UL } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Termos de uso',
  description: `Condições de uso do ${APP_NAME}.`,
  alternates: { canonical: ROUTES.TERMS },
}

export default function TermsPage() {
  return (
    <LegalPage title="Termos de uso" updatedAt="17 de novembro de 2026">
      <p>
        Estes termos regem o uso do {APP_NAME} (site, painel e aplicativo), operado por{' '}
        <ToConfirm>razão social</ToConfirm>, CNPJ <ToConfirm>CNPJ</ToConfirm>. Ao criar uma conta você concorda com eles
        e com a <A href={ROUTES.PRIVACY}>política de privacidade</A>.
      </p>

      <H2 id="servico">1. O serviço</H2>
      <p>
        O {APP_NAME} é uma ferramenta de administração para casas religiosas: membros, mensalidades, extrato, agenda,
        presença, cantina e loja, listas, campanhas, rifas, avisos e site da casa. Ele <strong>não movimenta dinheiro</strong>:
        os pagamentos acontecem fora do sistema e a casa registra o que recebeu.
      </p>

      <H2 id="conta">2. Conta</H2>
      <UL>
        <li>Você deve informar dados verdadeiros e manter sua senha em sigilo.</li>
        <li>Cada conta é pessoal. Quem cadastra uma casa passa a administrá-la.</li>
        <li>
          Você pode excluir a conta quando quiser (<A href={ROUTES.DELETE_ACCOUNT_INFO}>veja como</A>).
        </li>
        <li>
          Idade mínima: <ToConfirm>idade mínima para criar conta</ToConfirm>.
        </li>
      </UL>

      <H2 id="casa">3. Responsabilidades da casa</H2>
      <UL>
        <li>
          A casa é responsável pelos dados que registra sobre seus membros e visitantes, inclusive por ter base legal (e,
          para dados sensíveis, consentimento) para tratá-los.
        </li>
        <li>A casa é responsável pelos valores, cobranças e lançamentos que registra e pelo conteúdo do seu site.</li>
        <li>
          Os registros financeiros da casa continuam com ela mesmo quando um membro exclui a conta, identificados como
          &ldquo;Membro excluído&rdquo;.
        </li>
      </UL>

      <H2 id="uso">4. Uso permitido</H2>
      <p>
        Não é permitido usar o {APP_NAME} para atividade ilegal, para publicar conteúdo que discrimine ou ataque qualquer
        tradição religiosa ou pessoa, para tentar acessar dados de outra casa ou para atrapalhar o funcionamento do
        serviço. Contas que fizerem isso podem ser suspensas.
      </p>

      <H2 id="planos">5. Planos e preços</H2>
      <p>
        <ToConfirm>regras de planos, cobrança, cancelamento e reembolso</ToConfirm>
      </p>

      <H2 id="disponibilidade">6. Disponibilidade e responsabilidade</H2>
      <p>
        Trabalhamos para manter o serviço no ar e os dados seguros, mas ele pode passar por manutenções e falhas.{' '}
        <ToConfirm>limitação de responsabilidade</ToConfirm>
      </p>

      <H2 id="mudancas">7. Mudanças</H2>
      <p>Podemos atualizar estes termos. Mudanças relevantes serão avisadas no sistema.</p>

      <H2 id="lei">8. Lei e foro</H2>
      <p>
        Vale a lei brasileira. Foro: <ToConfirm>comarca do foro</ToConfirm>, sem prejuízo dos direitos do consumidor.
      </p>

      <H2 id="contato">9. Contato</H2>
      <p>
        <ToConfirm>e-mail de contato</ToConfirm>
      </p>
    </LegalPage>
  )
}
