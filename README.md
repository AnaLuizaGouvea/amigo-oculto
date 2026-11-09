# Amigo Oculto — envio automático pelo Gmail

Aplicação estática para realizar o sorteio de amigo oculto e enviar um e-mail individual a cada participante usando a conta Gmail do organizador.

## Funcionalidades

- Cadastro de participantes com nome, e-mail, tamanho da calça, blusa e calçado.
- Validação de e-mails duplicados e campos obrigatórios.
- Sorteio aleatório sem que alguém tire a si mesmo.
- Pares recíprocos são permitidos (A pode tirar B e B pode tirar A).
- Envio de mensagens individuais pela Gmail API.
- Cada mensagem informa o nome sorteado e os três tamanhos da pessoa sorteada.
- Acompanhamento de mensagens enviadas, pendentes e com falha.
- Possibilidade de tentar novamente somente os envios que falharam.
- Botão individual para abrir o WhatsApp com uma mensagem pronta e o link privado de cada participante, para envio manual em caso de falha ou não recebimento do e-mail.
- E-mails em HTML com apresentação visual, destaque para o nome sorteado e tabela de tamanhos, além de uma versão em texto simples para clientes de e-mail que não exibem HTML.

## Estrutura

```text
amigo-oculto/
├── index.html
└── README.md
```

O projeto não precisa de backend, Firebase, Cloudflare Workers ou serviço de e-mail de terceiros. O navegador solicita autorização do organizador ao Google e chama a Gmail API diretamente.

## Requisitos

- Uma conta Gmail para ser usada pelo organizador.
- Um projeto no Google Cloud.
- Gmail API habilitada.
- Um OAuth Client ID do tipo **Web application**.
- O site publicado em HTTPS, por exemplo, no GitHub Pages.

## Configuração do Google Cloud

### 1. Criar projeto e habilitar Gmail API

1. Acesse https://console.cloud.google.com/.
2. Crie um projeto, por exemplo `amigo-oculto-gmail`.
3. Abra **APIs e serviços → Biblioteca**.
4. Pesquise por **Gmail API** e clique em **Ativar**.

### 2. Configurar a tela de consentimento OAuth

Na seção **Google Auth Platform**:

1. Em **Branding**, informe o nome do aplicativo e um e-mail de suporte.
2. Em **Audience**, escolha **External** se estiver usando uma conta Gmail pessoal.
3. Mantenha o aplicativo em **Testing** para uso privado.
4. Em **Test users**, adicione o endereço Gmail do organizador — a mesma conta que fará os envios.
5. Em **Data Access**, adicione somente este escopo:

```text
https://www.googleapis.com/auth/gmail.send
```

Esse escopo permite enviar e-mails em nome da conta autorizada. O aplicativo não solicita acesso para ler a caixa de entrada.

Enquanto o aplicativo estiver em modo de teste, somente os usuários adicionados como test users poderão autorizar o acesso. O Google pode exibir um aviso de aplicativo não verificado; isso é esperado durante o teste de um aplicativo privado que ainda não passou pela verificação. Não adicione pessoas que não sejam necessárias.

### 3. Criar o OAuth Client ID

1. Na seção **Google Auth Platform → Clients**, clique em **Create client**.
2. Escolha **Web application**.
3. Dê um nome, por exemplo `Amigo Oculto GitHub Pages`.
4. Em **Authorized JavaScript origins**, adicione a origem do site.

Exemplos:

- GitHub Pages: `https://SEU-USUARIO.github.io`
- Domínio próprio: `https://www.seudominio.com`
- Teste local: `http://localhost:8000`

Use somente a origem (protocolo + domínio + porta, se houver), sem o caminho do repositório. Por exemplo, para `https://seu-usuario.github.io/amigo-oculto/`, a origem é `https://seu-usuario.github.io`.

5. Crie a credencial e copie o **Client ID**.

Não coloque um Client Secret no HTML. Aplicações executadas inteiramente no navegador não conseguem manter segredos. O código utiliza apenas o Client ID público e a autorização OAuth do Google.

## Publicar no GitHub Pages

1. Salve o arquivo fornecido como `index.html` na raiz do repositório.
2. Envie o arquivo para a branch principal.
3. No GitHub, abra **Settings → Pages**.
4. Selecione a branch principal e a pasta `/ (root)`.
5. Aguarde a publicação e abra o endereço gerado.

Depois, confirme que a origem exata do site está cadastrada no OAuth Client ID.

## Como realizar o sorteio e enviar

1. Abra o site publicado no navegador.
2. Cadastre uma pessoa por linha, neste formato:

```text
Nome, email, calça, blusa, calçado
Maria, maria@gmail.com, 38, M, 35
João, joao@hotmail.com, 42, G, 42
Carla, carla@outlook.com, 40, P, 37
```

3. Preencha o nome do evento e os detalhes opcionais.
4. Clique em **Sortear**.
5. Informe o OAuth Client ID na área de envio.
6. Clique em **Conectar Gmail** e escolha a conta Gmail do organizador.
7. Autorize o envio de e-mails.
8. Marque a confirmação de que os participantes concordaram em receber o resultado.
9. Clique em **Enviar resultados por e-mail**.

Cada pessoa receberá uma mensagem separada, sem os demais participantes em cópia. O e-mail tem versão HTML e alternativa em texto simples. O destinatário pode usar Gmail, Outlook, Hotmail ou qualquer outro provedor de e-mail.

### Alternativa manual pelo WhatsApp

Na lista **Entrega dos resultados**, cada participante terá o botão **Enviar link pelo WhatsApp**. Ao clicar, o navegador abrirá o WhatsApp com uma mensagem pronta e o link individual daquele participante. O organizador deve selecionar o contato correto e enviar manualmente. Não é necessário cadastrar telefone dos participantes.

O link abre a página publicada diretamente no resultado individual. Envie-o somente ao participante correspondente e não o compartilhe em grupos. A codificação do conteúdo do link serve apenas para transportar os dados no endereço; não é criptografia nem proteção contra alguém que obtenha o link.

## Custos e limites

- GitHub Pages: hospedagem gratuita para repositórios compatíveis com o plano do GitHub.
- Gmail API: o uso padrão da API está disponível sem custo adicional dentro das cotas publicadas pelo Google.
- Não há cobrança da Meta, Firebase Blaze, Brevo ou Cloudflare nesta implementação.
- Contas Gmail pessoais possuem limites diários de envio definidos pelo Google. O envio de 28 mensagens fica abaixo do limite usual de 500 mensagens por dia, desde que a conta não tenha consumido parte relevante dessa cota em outros envios.

Consulte os limites atuais:
- https://support.google.com/mail/answer/22839
- https://developers.google.com/workspace/gmail/api/reference/quota

## Segurança e privacidade

- A senha do Gmail nunca é solicitada nem armazenada pelo site.
- O token OAuth de acesso fica somente na memória da página e não é gravado no `localStorage`.
- O Client ID OAuth não é um segredo.
- A autorização solicitada usa apenas o escopo `gmail.send`.
- Os dados do sorteio são salvos no `localStorage` do navegador do organizador.
- Não compartilhe o computador ou o perfil do navegador usado para organizar o sorteio.
- O organizador tem acesso aos dados locais do sorteio. Esta versão não oferece sigilo criptográfico dos pares contra o próprio organizador.
- Se o navegador for fechado durante os envios, confira a pasta **Enviados** do Gmail antes de tentar novamente. Se uma mensagem tiver sido enviada, mas o navegador não tiver salvo o status, a nova tentativa poderá gerar duplicidade.
- O status “Enviado” indica que a Gmail API aceitou a solicitação; não confirma que a mensagem chegou à caixa de entrada ou foi lida. Verifique também spam e endereço do destinatário.

## Documentação oficial

- Gmail API — enviar mensagens: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send
- Quickstart JavaScript da Gmail API: https://developers.google.com/workspace/gmail/api/quickstart/js
- Google Identity Services para Web: https://developers.google.com/identity/oauth2/web/guides/overview
- Escopos da Gmail API: https://developers.google.com/workspace/gmail/api/auth/scopes
