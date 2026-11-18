/*
 * REVISÃO JURÍDICA PENDENTE. Termos de uso simples, escritos a partir do que o
 * sistema faz hoje (17/11/2026). Precisa de revisão de advogado(a) antes de
 * publicar; os trechos [A CONFIRMAR: ...] dependem da empresa.
 */
import type { Metadata } from 'next'

import { APP_NAME, ROUTES, siteUrl } from '@/constants'
import { A, H2, LegalPage, UL } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Termos de uso',
  description: `Condições de uso do ${APP_NAME}.`,
  alternates: { canonical: siteUrl(ROUTES.TERMS) },
}

export default function TermsPage() {
  return (
    <LegalPage title="Termos de uso" updatedAt="18 de novembro de 2026">
      <p>
        Estes termos regem o uso do {APP_NAME} (site, painel e aplicativo), operado por{' '}
        SARAVA TECNOLOGIA PARA TEMPLOS RELIGIOSOS LTDA (Saravá Tech), CNPJ 38.482.175/0001-55. Ao criar uma conta você concorda com eles
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
          Idade mínima: 18 anos.
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
        Toda casa nova tem 14 dias de teste grátis, com todos os recursos e sem cartão. Depois, a casa escolhe um plano: Casa
        (R$ 34,90 por mês ou R$ 349,00 por ano, até 100 pessoas) ou Casa Grande (R$ 54,90 por mês ou R$ 549,00 por ano,
        sem limite de pessoas). O pagamento é feito pelo Stripe, por cartão, boleto ou PIX. No cartão e no boleto a
        assinatura renova sozinha a cada período; no PIX, a casa paga cada período. Se o pagamento não for feito, a casa
        recebe avisos por 15 dias e, depois disso, o acesso fica suspenso até a regularização, sem perda de dados. A
        assinatura pode ser cancelada a qualquer momento no painel da casa e vale até o fim do período já pago, sem
        nova cobrança. Na primeira contratação, a casa pode desistir em até 7 dias e receber o valor de volta (art. 49
        do Código de Defesa do Consumidor); fora desse caso, não há reembolso proporcional de período já iniciado. Subir
        de plano vale na hora, com cobrança proporcional; descer de plano vale no período seguinte. Mudanças de preço
        são avisadas com pelo menos 30 dias de antecedência e valem a partir da renovação seguinte.
      </p>

      <H2 id="disponibilidade">6. Disponibilidade e responsabilidade</H2>
      <p>
        Trabalhamos para manter o serviço no ar e os dados seguros, mas ele pode passar por manutenções e falhas.{' '}
        A casa é responsável pelos dados que cadastra e pelas cobranças que faz aos seus membros; os pagamentos
        entre membros e casa (PIX, dinheiro) acontecem fora do {APP_NAME}, que não recebe nem guarda esse dinheiro. Na
        medida permitida pela lei, não respondemos por lucros cessantes ou danos indiretos decorrentes de
        indisponibilidade do serviço, e nossa responsabilidade fica limitada ao valor pago pela casa nos 12 meses
        anteriores ao fato, sem prejuízo dos direitos garantidos pelo Código de Defesa do Consumidor.
      </p>

      <H2 id="mudancas">7. Mudanças</H2>
      <p>Podemos atualizar estes termos. Mudanças relevantes serão avisadas no sistema.</p>

      <H2 id="lei">8. Lei e foro</H2>
      <p>
        Vale a lei brasileira. Foro: comarca do Rio de Janeiro (RJ), sem prejuízo dos direitos do consumidor.
      </p>

      <H2 id="contato">9. Contato</H2>
      <p>
        contato@saravatech.com
      </p>
    </LegalPage>
  )
}
