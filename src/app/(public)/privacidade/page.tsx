/*
 * REVISÃO JURÍDICA PENDENTE. Este texto foi escrito a partir do código do
 * sistema (back release/v2 + feat/excluir-conta, web e app) em 17/11/2026 e
 * PRECISA ser revisado por advogado(a) antes de publicar. Os trechos
 * [A CONFIRMAR: ...] dependem de dados da empresa ou de decisões que o código
 * não responde; nada ali foi inventado. Se o sistema passar a coletar dado
 * novo (ou mudar de provedor/região), esta página tem que mudar junto.
 */
import type { Metadata } from 'next'

import { APP_NAME, ROUTES, siteUrl } from '@/constants'
import { A, H2, H3, LegalPage, ToConfirm, UL } from '@/components/legal/legal-page'

export const metadata: Metadata = {
  title: 'Política de privacidade',
  description: `Como o ${APP_NAME} trata dados pessoais, conforme a LGPD.`,
  alternates: { canonical: siteUrl(ROUTES.PRIVACY) },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidade" updatedAt="17 de novembro de 2026">
      <p>
        Esta política explica quais dados pessoais o {APP_NAME} trata, para quê, com quem compartilha, por quanto tempo
        guarda e como você exerce seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
        Vale para o site, o painel na web e o aplicativo para celular.
      </p>

      <H2 id="quem-somos">1. Quem somos e quem decide sobre os dados</H2>
      <p>
        O {APP_NAME} é operado por <ToConfirm>razão social</ToConfirm>, inscrita no CNPJ sob o nº{' '}
        <ToConfirm>CNPJ</ToConfirm>, com sede em <ToConfirm>endereço</ToConfirm>.
      </p>
      <UL>
        <li>
          <strong>Dados da sua conta</strong> (login, perfil, notificações, segurança): o {APP_NAME} é o{' '}
          <em>controlador</em>.
        </li>
        <li>
          <strong>Dados que cada casa registra</strong> sobre seus membros e suas finanças (cadastro de médium,
          mensalidades, pagamentos, presença, cantina etc.): a casa é a <em>controladora</em> e o {APP_NAME} atua como{' '}
          <em>operador</em>, tratando esses dados para a casa e conforme as instruções dela.{' '}
          <ToConfirm>enquadramento de controlador e operador validado pela assessoria jurídica</ToConfirm>
        </li>
      </UL>

      <H2 id="dados">2. Quais dados tratamos</H2>
      <H3>2.1 Conta e perfil</H3>
      <UL>
        <li>E-mail e senha de acesso. A senha fica com o Firebase Authentication (Google), em forma cifrada; nós não a vemos.</li>
        <li>Nome completo, telefone e telefone alternativo.</li>
        <li>Tipo e número de documento (CPF ou CNPJ) informados no cadastro da casa ou no cadastro por convite.</li>
        <li>Foto de perfil, se houver.</li>
      </UL>

      <H3>2.2 Cadastro de membro na casa</H3>
      <p>Quando você entra numa casa por convite, a casa recebe:</p>
      <UL>
        <li>CPF, RG, tipo sanguíneo, nome e telefone de um contato de emergência;</li>
        <li>
          se a casa preencher: orixá, datas de início de desenvolvimento e de iniciação e observações.
        </li>
      </UL>
      <p>
        Tipo sanguíneo é dado de saúde, e orixá e datas de iniciação revelam convicção religiosa. A LGPD chama esses
        dados de <strong>sensíveis</strong> (art. 5º, II) e eles têm proteção reforçada (veja a seção 3).
      </p>

      <H3>2.3 Dados da casa</H3>
      <UL>
        <li>Nome, endereço, dias de gira, telefones de contato e configuração do site público da casa.</li>
        <li>Chave PIX e dados de recebimento que a casa mostra para os membros pagarem.</li>
      </UL>

      <H3>2.4 Registros financeiros e de atividade da casa</H3>
      <p>
        Mensalidades, pagamentos, dívidas e fiado, vendas da cantina e da loja, inscrições em listas, campanhas e
        contribuições, rifas e reservas, cobranças entre membros, lançamentos do extrato (livro-caixa), presença em giras
        e eventos, confirmações de presença e avisos. O {APP_NAME} <strong>não processa pagamentos</strong> nem guarda
        dados de cartão: cada pessoa paga pelo seu banco e a casa registra o recebimento.
      </p>

      <H3>2.5 Conteúdo que você cria</H3>
      <p>Notas pessoais (visíveis só para você) e, para a liderança, avisos e mensagens enviados aos membros.</p>

      <H3>2.6 Visitantes das páginas públicas da casa</H3>
      <p>
        Quem reserva números de rifa, registra uma contribuição para campanha ou faz pedido na loja ou cantina pelo site
        público da casa informa nome e telefone (WhatsApp), sem criar conta. Esses dados vão para a casa.
      </p>

      <H3>2.7 Notificações</H3>
      <UL>
        <li>
          Identificador do aparelho para notificações (token de push), plataforma (iOS, Android ou navegador) e nome do
          aparelho;
        </li>
        <li>suas preferências de notificação por categoria e a sua caixa de notificações dentro do sistema.</li>
      </UL>

      <H3>2.8 Câmera</H3>
      <p>
        O aplicativo usa a câmera para ler o QR Code de presença (essas imagens não são gravadas nem enviadas) e, se
        você escolher, para fotografar um comprovante de pagamento, que é enviado como explicado na seção 2.11.
      </p>

      <H3>2.9 Registros técnicos e de segurança</H3>
      <UL>
        <li>
          Registro de auditoria das ações feitas no sistema (quem fez, o quê, em qual casa e quando). No registro de
          login guardamos também o e-mail usado.
        </li>
        <li>
          Registros de servidor (logs) do Google Cloud, com identificadores internos de usuário e de casa. Os provedores
          podem registrar endereço IP e dados do navegador ou aparelho para segurança.
        </li>
      </UL>

      <H3>2.10 Medição de uso (somente no site)</H3>
      <p>
        No site, quando ativado, usamos o Google Analytics for Firebase para entender o uso: páginas visitadas, eventos
        (entrada, cadastro, registro de pagamentos com categoria e valor, reservas de rifa e contribuições nas páginas
        públicas, erros), o identificador interno da conta e o papel na casa. Não usamos esses dados para publicidade. O
        aplicativo para celular não usa ferramenta de medição.{' '}
        <ToConfirm>se o Google Analytics está ativo em produção e se haverá aviso/consentimento de cookies</ToConfirm>
      </p>
      <H3>2.11 Comprovantes de pagamento (PIX)</H3>
      <p>
        Quando você paga a casa por PIX, pode enviar o comprovante pelo aplicativo ou pelo site para dar baixa no que
        deve. Tratamos:
      </p>
      <UL>
        <li>o <strong>arquivo</strong> enviado (foto, print ou PDF do comprovante);</li>
        <li>
          os <strong>dados lidos do comprovante</strong>: valor, data e hora, identificador da transação (ID PIX/E2E),
          chave e nome de quem recebeu e banco de quem recebeu, e nome, CPF parcial (mascarado, como o banco mostra) e
          banco de quem pagou;
        </li>
        <li>o resultado das conferências, a decisão (baixa automática, aprovação, recusa ou baixa desfeita) e quem decidiu.</li>
      </UL>
      <p>
        <strong>Para quê</strong>: dar baixa no que você deve à casa (mensalidades, dívidas, cantina, loja, listas, rifas)
        e permitir que a casa confira o pagamento e prove o recebimento. A base legal é a execução do contrato (art. 7º,
        V) e, para guardar o comprovante como registro financeiro da casa, o exercício regular de direitos e o
        cumprimento de obrigação legal (art. 7º, II e VI).
      </p>
      <p>
        <strong>Leitura automática</strong>: o arquivo é enviado à Google LLC (EUA), pela Gemini API (modelos de
        inteligência artificial Gemini), que atua como operadora/suboperadora só para ler os dados do comprovante. Usamos
        o serviço pago, em que o Google não usa o conteúdo enviado nem as respostas para melhorar os produtos dele. Como
        alternativa, a leitura pode ser feita pela Anthropic, PBC (EUA), com o modelo Claude, nas mesmas condições.{' '}
        <ToConfirm>provedor em uso, não uso para treino e prazo de retenção (o Google guarda por tempo limitado para detectar abuso), conforme os termos comerciais contratados</ToConfirm>{' '}
        Quando tudo confere (valor, chave da casa, data, transação nunca usada) e o valor está dentro do teto definido
        pela casa, a baixa é feita na hora; se algo não confere, uma pessoa da casa (Liderança ou quem cuida do caixa)
        confere e decide. A casa pode desligar a baixa automática.
      </p>
      <p>
        <strong>Quem vê</strong>: você, a Liderança e quem cuida do caixa da sua casa. Outros membros não veem.
      </p>
      <p>
        <strong>Onde fica</strong>: o arquivo e os dados ficam no Firebase/Google Cloud, na região de São Paulo
        (southamerica-east1), com acesso só pelo servidor.
      </p>
      <p>
        <strong>Por quanto tempo</strong>: 5 anos a partir do envio, por ser documento financeiro da casa.{' '}
        <ToConfirm>prazo de guarda dos comprovantes validado com contador/jurídico</ToConfirm> Depois disso o arquivo é
        apagado e o nome do pagador é anonimizado; fica só o registro contábil.
      </p>
      <p>
        <strong>Se você excluir a conta</strong>: comprovantes que já deram baixa ficam com a casa como prova financeira,
        com o seu nome de pagador anonimizado; comprovantes ainda não conferidos são apagados (arquivo e dados).{' '}
        <strong>Se a casa for apagada</strong>, os arquivos de comprovante dela são apagados.
      </p>

      <p>
        <strong>Não vendemos dados pessoais e não os usamos para publicidade.</strong>
      </p>

      <H2 id="finalidades">3. Para que usamos e com qual base legal</H2>
      <UL>
        <li>
          <strong>Criar e manter sua conta, autenticar e prestar o serviço</strong> (gestão de membros, financeiro,
          agenda, presença, cantina, listas, rifas, site da casa): execução de contrato (art. 7º, V).
        </li>
        <li>
          <strong>Dados sensíveis do cadastro de médium</strong> (tipo sanguíneo, orixá, datas de iniciação):
          consentimento específico e destacado do titular (art. 11, I), coletado pela casa.{' '}
          <ToConfirm>
            forma de coleta desse consentimento; hoje o formulário de cadastro por convite não tem um aceite específico
          </ToConfirm>
        </li>
        <li>
          <strong>Enviar notificações</strong> que você pediu (avisos, agenda, mensalidade, pedidos): execução de contrato;
          o envio ao celular depende da sua autorização no aparelho, que pode ser retirada a qualquer momento.
        </li>
        <li>
          <strong>Segurança, auditoria e prevenção de fraude</strong>: legítimo interesse (art. 7º, IX) e exercício
          regular de direitos (art. 7º, VI).
        </li>
        <li>
          <strong>Guarda de registros de acesso</strong>: cumprimento de obrigação legal (art. 7º, II; Marco Civil da
          Internet, art. 15).
        </li>
        <li>
          <strong>Ler comprovantes de PIX e dar baixa no que o membro deve</strong> (seção 2.11): execução de contrato
          (art. 7º, V); guarda do comprovante como prova financeira da casa: exercício regular de direitos e obrigação
          legal (art. 7º, II e VI).
        </li>
        <li>
          <strong>Manter os registros financeiros da casa</strong>, inclusive depois que um membro exclui a conta:
          cumprimento de obrigação legal ou regulatória da casa e exercício regular de direitos (art. 7º, II e VI; art.
          16).
        </li>
        <li>
          <strong>Medição de uso do site</strong>: legítimo interesse (art. 7º, IX).{' '}
          <ToConfirm>base legal da medição de uso (legítimo interesse ou consentimento)</ToConfirm>
        </li>
      </UL>

      <H2 id="compartilhamento">4. Com quem compartilhamos</H2>
      <UL>
        <li>
          <strong>Dentro da sua casa.</strong> A liderança e as pessoas com permissão veem os dados dos membros da casa.
          Os demais membros veem o necessário para a vida da casa (por exemplo, o nome em listas e escalas). Cada casa vê
          só os próprios dados.
        </li>
        <li>
          <strong>Site público da casa.</strong> O que a casa escolhe publicar: nome, endereço, contatos, agenda,
          campanhas, rifas e loja.
        </li>
        <li>
          <strong>Provedores que operam o serviço para nós</strong>: Google (Firebase Authentication, Cloud Firestore,
          Cloud Functions, Firebase Hosting, Cloud Run, Cloud Logging, Firebase Cloud Messaging e Google Analytics); Expo
          (650 Industries, Inc., EUA), que entrega as notificações do aplicativo; Apple e Google, que entregam as
          notificações ao aparelho; Google LLC (Gemini API) e, como alternativa, Anthropic, PBC (EUA), que leem os
          comprovantes de PIX enviados (seção 2.11).
        </li>
        <li>
          <strong>Autoridades</strong>, quando a lei ou uma ordem judicial exigir.
        </li>
      </UL>

      <H2 id="onde">5. Onde os dados ficam</H2>
      <p>
        As funções do servidor e o site rodam na região de São Paulo do Google Cloud (southamerica-east1). O banco de
        dados fica na região <ToConfirm>região do Cloud Firestore de produção</ToConfirm>. Alguns provedores (Firebase
        Authentication, Google Analytics, Expo, Apple e, na leitura dos comprovantes, o Google (Gemini API) ou a Anthropic) tratam dados fora do Brasil, principalmente nos Estados Unidos.
        Essa transferência internacional se apoia nas garantias contratuais desses provedores (art. 33 da LGPD).{' '}
        <ToConfirm>mecanismo de transferência internacional adotado (cláusulas-padrão da ANPD)</ToConfirm>
      </p>

      <H2 id="retencao">6. Por quanto tempo guardamos</H2>
      <UL>
        <li>
          <strong>Enquanto a conta existir</strong>, guardamos os dados para prestar o serviço.
        </li>
        <li>
          <strong>Quando você exclui a conta</strong>, apagamos na hora o login, o nome, o e-mail, os telefones, o
          documento, a foto, o cadastro de médium (CPF, RG, tipo sanguíneo, contato de emergência, orixá, datas e
          observações), as notas pessoais, as notificações, os aparelhos cadastrados para push e as preferências. O seu
          vínculo com todas as casas é encerrado.
        </li>
        <li>
          <strong>O que fica com a casa</strong>: mensalidades, pagamentos, dívidas (inclusive as em aberto), vendas,
          lançamentos do extrato e presença continuam na casa, porque ela precisa da contabilidade. Esses registros passam
          a aparecer como &ldquo;Membro excluído&rdquo;. Descrições de lançamentos já feitos não são reescritas (o
          livro-caixa não pode ser alterado) e podem conter o nome como foi registrado na época. A casa guarda esses
          registros por <ToConfirm>prazo de guarda dos registros financeiros, ex.: 5 anos</ToConfirm>.
        </li>
        <li>
          <strong>Casa sem ninguém</strong>: se a última pessoa da casa exclui a conta, a casa é desativada (sai do login
          e do site público) e os registros ficam guardados pelo prazo acima. Depois disso são apagados.{' '}
          <ToConfirm>processo de eliminação das casas desativadas após o prazo</ToConfirm>
        </li>
        <li>
          <strong>Comprovantes de PIX</strong>: 5 anos a partir do envio <ToConfirm>prazo de guarda dos comprovantes</ToConfirm>;
          na exclusão da conta, os que já deram baixa ficam com o pagador anonimizado e os não conferidos são apagados
          (seção 2.11).
        </li>
        <li>
          <strong>Registros de auditoria</strong> (sem o e-mail): <ToConfirm>prazo de guarda</ToConfirm>.{' '}
          <strong>Registros de acesso</strong>: no mínimo 6 meses (Marco Civil da Internet).{' '}
          <strong>Logs de servidor</strong>: <ToConfirm>prazo de retenção do Cloud Logging</ToConfirm>.{' '}
          <strong>Cópias de segurança</strong>: <ToConfirm>se há backup do banco e por quanto tempo</ToConfirm>.
        </li>
      </UL>

      <H2 id="direitos">7. Seus direitos</H2>
      <p>Pela LGPD (art. 18), você pode pedir:</p>
      <UL>
        <li>confirmação de que tratamos seus dados e acesso a eles;</li>
        <li>correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
        <li>portabilidade;</li>
        <li>eliminação dos dados tratados com base no consentimento e revogação do consentimento;</li>
        <li>informação sobre com quem compartilhamos;</li>
        <li>oposição a tratamento feito com base em legítimo interesse.</li>
      </UL>
      <p>
        <strong>Excluir a conta</strong>: pelo aplicativo (Eu &gt; Excluir minha conta) ou pelo site (Minha conta &gt;
        Excluir minha conta). Se não consegue entrar, veja <A href={ROUTES.DELETE_ACCOUNT_INFO}>como pedir a exclusão</A>.
      </p>
      <p>
        Para os demais pedidos, escreva para o encarregado (seção 11). Pedidos sobre dados que a casa controla (por
        exemplo, corrigir uma mensalidade) são encaminhados à casa. Respondemos em até 15 dias. Você também pode
        reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
      </p>
      <p>
        A única decisão automatizada é a baixa automática por comprovante de PIX (seção 2.11), que só reconhece um
        pagamento; quando algo não confere, quem decide é uma pessoa da casa. Você pode pedir à casa a revisão de
        qualquer decisão sobre um comprovante (art. 20).
      </p>

      <H2 id="seguranca">8. Segurança</H2>
      <p>
        A comunicação é sempre criptografada (HTTPS). Os dados só são lidos e gravados pelo servidor, que confere em cada
        operação se você pertence à casa e tem permissão; o acesso direto ao banco de dados é bloqueado. As senhas ficam
        com o Firebase Authentication. As ações importantes ficam registradas em auditoria. Se acontecer um incidente de
        segurança que possa trazer risco a você, avisamos a ANPD e as pessoas afetadas.
      </p>

      <H2 id="criancas">9. Crianças e adolescentes</H2>
      <p>
        O {APP_NAME} é destinado a maiores de 18 anos. Menores só podem ser cadastrados pela casa com o consentimento de
        pelo menos um dos pais ou responsável (art. 14).{' '}
        <ToConfirm>idade mínima e regra para cadastro de menores</ToConfirm>
      </p>

      <H2 id="armazenamento-local">10. Cookies e armazenamento no navegador</H2>
      <p>
        O site guarda no seu navegador a sessão de login (Firebase Authentication), o seu perfil e a casa selecionada,
        necessários para o painel funcionar. Se a medição de uso estiver ativa, o Google Analytics também usa cookies.
      </p>

      <H2 id="encarregado">11. Encarregado e contato</H2>
      <p>
        Encarregado pelo tratamento de dados pessoais (DPO): <ToConfirm>nome do encarregado</ToConfirm>, e-mail{' '}
        <ToConfirm>e-mail do encarregado</ToConfirm>.
      </p>

      <H2 id="alteracoes">12. Alterações desta política</H2>
      <p>
        Podemos atualizar esta política quando o serviço mudar. A data no topo indica a última versão. Mudanças
        relevantes serão avisadas no sistema.
      </p>
    </LegalPage>
  )
}
