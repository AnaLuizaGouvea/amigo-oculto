# Backend do Amigo Oculto — WhatsApp Cloud API

Este backend envia uma mensagem de modelo (template) aprovada pela Meta para cada participante. O token da Meta fica somente no servidor.

## 1. Pré-requisitos na Meta

1. Criar/configurar um app no Meta for Developers e adicionar o produto WhatsApp.
2. Configurar uma conta do WhatsApp Business Platform e um número remetente.
3. Obter `Phone Number ID` e um token de acesso adequado. Para produção, prefira token de sistema/permanente com as permissões necessárias, em vez do token temporário de testes.
4. Criar e aguardar aprovação de um modelo de mensagem em português (`pt_BR`) com nome `amigo_oculto_resultado` e três variáveis no corpo, nesta ordem:
   - `{{1}}`: nome do participante;
   - `{{2}}`: nome do evento;
   - `{{3}}`: link individual do envelope.

Sugestão de texto para submeter à Meta (a categoria será definida/revisada pela Meta; não presuma que será Utility):

> Olá, {{1}}! O sorteio de {{2}} foi realizado. Para consultar seu resultado, acesse seu envelope individual: {{3}}. Não compartilhe esse link, pois ele contém seu resultado. Se não deseja receber mensagens sobre este evento, responda SAIR.

A Meta precisa aprovar o modelo antes do envio. A classificação/cobrança depende da categoria atribuída pela Meta.

## 2. Publicar o backend

É possível usar Render ou outro host Node.js. No Render:

1. Crie um repositório Git com o conteúdo desta pasta.
2. Crie um Web Service a partir do repositório. O `render.yaml` sugere o plano gratuito, sujeito à disponibilidade e às limitações vigentes do Render.
3. Configure as variáveis de ambiente listadas em `.env.example` no painel do host. Não suba um arquivo `.env` com segredos para o Git.
4. Configure `ALLOWED_ORIGIN` com a origem exata do seu GitHub Pages, por exemplo `https://usuario.github.io` (ou `https://usuario.github.io/repositorio` se esse for o origin? O navegador envia somente scheme + host + port; portanto use `https://usuario.github.io`).
5. Configure `ADMIN_KEY` com uma chave longa e aleatória. Use a mesma chave no campo de administrador do site.
6. Após publicar, teste `https://SEU-BACKEND/health`. Deve responder `{"ok":true,...}`.

## 3. Configurar o frontend

Na tela de organizador do site, informe a URL base do backend (ex.: `https://seu-servico.onrender.com`) e a chave administrativa. Não coloque o token da Meta no frontend.

## 4. Regras importantes

- Cada pessoa deve ter fornecido o número e autorizado receber a mensagem pelo WhatsApp. A caixa de confirmação do site é uma declaração do organizador; ela não substitui a obtenção real do consentimento de cada participante.
- Mensagens iniciadas pela empresa precisam usar um modelo aprovado. Mensagens livres só podem ser enviadas dentro da janela de atendimento de 24 horas após a pessoa iniciar a conversa.
- Faça primeiro um teste com números controlados por você.
- O envio pode ter sucesso parcial. Confira o resultado por participante e reenvie somente os que falharam.
- A resposta `sent` confirma que a API aceitou a mensagem e retornou um ID; não significa necessariamente que o destinatário já a leu.
- Este backend não armazena a lista nem os resultados; processa a requisição em memória e retorna os estados ao navegador.
- O link individual gerado pelo frontend atual é apenas ofuscado, não criptografado. Qualquer pessoa que possua o link pode decodificar o resultado. Para maior privacidade, será necessário migrar os envelopes para tokens aleatórios validados pelo backend.

## Variáveis de ambiente

Veja `.env.example`.
