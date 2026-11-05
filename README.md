# Amigo Oculto

Aplicação web simples para organizar um sorteio de amigo oculto,
consultar os resultados por envelopes individuais e compartilhar cada
resultado pelo WhatsApp.

## Funcionalidades

-   Cadastro dos participantes por uma lista de texto.
-   Validação dos dados dos participantes, incluindo nome, telefone e
    tamanhos de roupa.
-   Sorteio aleatório sem que alguém tire a si mesmo.
-   Cada participante acessa somente o próprio resultado por meio de um
    link individual.
-   Envio dos links pelo WhatsApp.
-   Possibilidade de configurar o envio automático por meio da
    **WhatsApp Cloud API oficial**, usando um backend separado.

> **Importante:** o envio manual pelo WhatsApp funciona sem backend. O
> envio automático depende da configuração e publicação do backend e da
> configuração da conta da Meta.

## Estrutura do projeto

Uma organização sugerida para o repositório é:

``` text
amigo-oculto/
├── index.html
├── README.md
└── backend/
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── render.yaml
    └── README.md
```

-   `index.html`: aplicação web (HTML, CSS e JavaScript).
-   `backend/`: serviço Node.js responsável por encaminhar os envios à
    WhatsApp Cloud API.
-   `backend/README.md`: instruções específicas para configurar e
    publicar o backend.

Se os arquivos do backend estiverem em outro diretório, ajuste os
caminhos conforme a estrutura real do repositório.

## Executar localmente

Como o frontend é uma página estática, basta abrir `index.html` em um
navegador.

Para testar por um servidor local, também é possível usar a extensão
Live Server do VS Code ou outro servidor HTTP estático.

## Publicar o frontend no GitHub Pages

1.  Envie `index.html` e este `README.md` para a raiz do repositório
    GitHub.
2.  No GitHub, acesse **Settings → Pages**.
3.  Em **Build and deployment**, selecione a opção de publicação a
    partir de uma branch.
4.  Escolha a branch principal (por exemplo, `main`) e a pasta
    `/ (root)`.
5.  Salve e aguarde a publicação.
6.  Acesse a URL apresentada pelo GitHub Pages.

O GitHub Pages hospeda somente o frontend estático. Ele não executa o
servidor Node.js do backend.

## Envio manual pelo WhatsApp

O modo manual não exige configuração de API:

1.  Cadastre os participantes e realize o sorteio.
2.  Acesse a área de envio.
3.  Abra o link de WhatsApp de cada participante.
4.  Confira a mensagem e conclua o envio no próprio WhatsApp.

## Envio automático --- WhatsApp Cloud API

O envio automático requer um backend Node.js publicado em um serviço de
hospedagem compatível.

Em linhas gerais, será necessário:

1.  Configurar um aplicativo no Meta for Developers e adicionar o
    produto WhatsApp.
2.  Configurar uma conta do WhatsApp Business Platform e um número
    remetente.
3.  Obter o `Phone Number ID` e um token com as permissões necessárias.
4.  Criar e obter aprovação da Meta para o modelo de mensagem utilizado
    pelo projeto.
5.  Publicar o conteúdo da pasta `backend/` em um host Node.js.
6.  Configurar as variáveis de ambiente do backend.
7.  Informar no frontend a URL do backend e a chave administrativa.

Consulte [`backend/README.md`](backend/README.md) para os passos
detalhados e os nomes das variáveis.

### Segurança

-   **Nunca** coloque o token de acesso da Meta no `index.html`, no
    JavaScript do navegador ou em arquivos versionados.
-   Configure os segredos diretamente no painel do serviço de
    hospedagem.
-   Não publique o arquivo `.env`.
-   Restrinja a origem permitida (`ALLOWED_ORIGIN`) ao domínio do
    frontend.
-   Use uma chave administrativa longa e aleatória.
-   Faça testes com números controlados antes de enviar mensagens aos
    participantes.

### Consentimento e regras da Meta

Envie mensagens somente a participantes que forneceram seus números e
autorizaram o recebimento. Mensagens iniciadas pela empresa precisam
utilizar um modelo aprovado pela Meta, conforme as regras vigentes do
WhatsApp Business Platform. A categoria do modelo e os custos são
definidos pela Meta e podem mudar; confira as condições atuais antes do
envio.

## Limitações e privacidade

-   O frontend é uma aplicação estática; a publicação no GitHub Pages
    não substitui o backend.
-   Os links individuais gerados pela versão atual usam ofuscação, não
    criptografia. Portanto, quem tiver acesso ao link poderá recuperar o
    resultado correspondente.
-   Evite compartilhar publicamente os links individuais.
-   O backend descrito no projeto encaminha os envios, mas não deve ser
    considerado um sistema de armazenamento seguro dos resultados.
-   A confirmação de envio pela API indica que a solicitação foi aceita
    pela plataforma; não garante que a mensagem foi lida pelo
    destinatário.

## Tecnologias

-   HTML
-   CSS
-   JavaScript
-   Node.js (backend opcional para envio automático)
-   WhatsApp Cloud API (integração opcional)

## Licença

Defina aqui a licença do projeto caso pretenda permitir reutilização ou
distribuição por outras pessoas.
