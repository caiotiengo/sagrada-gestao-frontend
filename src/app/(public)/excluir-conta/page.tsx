/*
 * REVISÃO JURÍDICA PENDENTE. Página pública de exclusão de conta (URL pedida
 * pelo Google Play em "Exclusão de dados"). As regras descritas aqui são as do
 * callable deleteMyAccount (back, feat/excluir-conta). Os trechos
 * [A CONFIRMAR: ...] precisam ser preenchidos antes de publicar.
 */
import type { Metadata } from 'next'

import { APP_NAME, ROUTES } from '@/constants'
import { A, H2, LegalPage, ToConfirm, UL } from '@/components/legal/legal-page'
import { DeleteAccountExplanation } from '@/components/account/delete-account-section'

export const metadata: Metadata = {
  title: 'Excluir conta',
  description: `Como excluir sua conta do ${APP_NAME} e o que acontece com seus dados.`,
  alternates: { canonical: ROUTES.DELETE_ACCOUNT_INFO },
}

export default function DeleteAccountInfoPage() {
  return (
    <LegalPage title={`Excluir sua conta do ${APP_NAME}`} updatedAt="17 de novembro de 2026">
      <p>
        Você pode excluir sua conta a qualquer momento, sem precisar falar com ninguém. A exclusão é definitiva.
      </p>

      <H2 id="pelo-app">Pelo aplicativo</H2>
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>Abra o {APP_NAME} e entre na sua conta.</li>
        <li>
          Toque em <strong>Eu</strong> e, em <strong>Segurança</strong>, em <strong>Excluir minha conta</strong>.
        </li>
        <li>Confirme sua senha, digite <strong>EXCLUIR</strong> e toque em <strong>Excluir minha conta</strong>.</li>
      </ol>

      <H2 id="pelo-site">Pelo site</H2>
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>
          Entre em <A href={ROUTES.LOGIN}>{ROUTES.LOGIN}</A>.
        </li>
        <li>Abra <strong>Minha conta</strong> (no menu, ao lado do seu nome).</li>
        <li>
          Em <strong>Excluir minha conta</strong>, confirme sua senha, digite <strong>EXCLUIR</strong> e clique em{' '}
          <strong>Excluir definitivamente</strong>.
        </li>
      </ol>

      <H2 id="o-que-acontece">O que acontece com seus dados</H2>
      <DeleteAccountExplanation mutedClassName="text-sg-muted" />
      <p>
        Mais detalhes, inclusive prazos de guarda, na <A href={ROUTES.PRIVACY}>política de privacidade</A>.
      </p>

      <H2 id="sem-acesso">Não consegue entrar?</H2>
      <p>
        Primeiro tente <A href={ROUTES.FORGOT_PASSWORD}>recuperar a senha</A>. Se não tiver mais acesso ao e-mail da
        conta, peça a exclusão por e-mail para <ToConfirm>e-mail para pedidos de exclusão</ToConfirm>, informando:
      </p>
      <UL>
        <li>o e-mail da conta;</li>
        <li>seu nome completo e o nome da casa;</li>
        <li>o pedido: &ldquo;excluir minha conta do {APP_NAME}&rdquo;.</li>
      </UL>
      <p>
        Antes de excluir, confirmamos que o pedido é seu (por exemplo, com uma mensagem para o e-mail ou o telefone
        cadastrados). A exclusão é feita em até 15 dias e segue as mesmas regras acima.
      </p>
    </LegalPage>
  )
}
