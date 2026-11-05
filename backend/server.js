'use strict';

const http = require('node:http');
const crypto = require('node:crypto');

const PORT = Number(process.env.PORT || 3000);
const ADMIN_KEY = process.env.ADMIN_KEY || '';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || '';
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || 'amigo_oculto_resultado';
const TEMPLATE_LANGUAGE = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'pt_BR';
const GRAPH_VERSION = process.env.META_GRAPH_VERSION || 'v23.0';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (Buffer.byteLength(raw) > 256 * 1024) {
        reject(new Error('Corpo da requisição muito grande.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); }
      catch { reject(new Error('JSON inválido.')); }
    });
    req.on('error', reject);
  });
}

function validPhone(value) {
  return typeof value === 'string' && /^\d{11,15}$/.test(value);
}

async function sendTemplateMessage(participant) {
  const endpoint = `https://graph.facebook.com/${GRAPH_VERSION}/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: participant.phone,
    type: 'template',
    template: {
      name: TEMPLATE_NAME,
      language: { code: TEMPLATE_LANGUAGE },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: participant.name },
          { type: 'text', text: participant.eventTitle },
          { type: 'text', text: participant.link }
        ]
      }]
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.error_user_msg || data?.error?.message || `Erro HTTP ${response.status}`;
    throw new Error(message);
  }
  return data?.messages?.[0]?.id || null;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGIN && origin && origin !== ALLOWED_ORIGIN) {
    return json(res, 403, { error: 'Origem não autorizada.' });
  }
  if (origin && (!ALLOWED_ORIGIN || origin === ALLOWED_ORIGIN)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const path = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  if (req.method === 'GET' && path === '/health') {
    return json(res, 200, { ok: true, service: 'amigo-oculto-whatsapp-api' });
  }
  if (req.method !== 'POST' || path !== '/api/send-draw') {
    return json(res, 404, { error: 'Rota não encontrada.' });
  }

  if (!ADMIN_KEY || !ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    return json(res, 503, { error: 'Backend não configurado. Verifique as variáveis de ambiente.' });
  }
  if (!safeEqual(req.headers['x-admin-key'] || '', ADMIN_KEY)) {
    return json(res, 401, { error: 'Chave administrativa inválida.' });
  }

  let body;
  try { body = await readBody(req); }
  catch (error) { return json(res, 400, { error: error.message }); }

  if (body.confirmedConsent !== true) {
    return json(res, 400, { error: 'Confirme que todos os participantes autorizaram o recebimento da mensagem.' });
  }
  if (!Array.isArray(body.participants) || body.participants.length < 1 || body.participants.length > 100) {
    return json(res, 400, { error: 'Informe entre 1 e 100 participantes.' });
  }

  const invalid = body.participants.some(p =>
    !p || typeof p.name !== 'string' || p.name.length < 1 || p.name.length > 80 ||
    !validPhone(p.phone) || typeof p.link !== 'string' ||
    !p.link.startsWith('https://') || p.link.length > 2000 ||
    typeof p.eventTitle !== 'string' || p.eventTitle.length > 80
  );
  if (invalid) return json(res, 400, { error: 'Há dados inválidos na lista de participantes.' });

  const phones = body.participants.map(p => p.phone);
  if (new Set(phones).size !== phones.length) {
    return json(res, 400, { error: 'Há telefones repetidos na lista.' });
  }

  // Envio sequencial para facilitar o controle de falhas e evitar rajadas desnecessárias.
  const results = [];
  for (const participant of body.participants) {
    try {
      const messageId = await sendTemplateMessage(participant);
      results.push({ phone: participant.phone, name: participant.name, sent: true, messageId });
    } catch (error) {
      results.push({ phone: participant.phone, name: participant.name, sent: false, error: error.message });
    }
  }
  const sent = results.filter(r => r.sent).length;
  return json(res, 200, { total: results.length, sent, failed: results.length - sent, results });
});

server.listen(PORT, () => {
  console.log(`Amigo Oculto API listening on port ${PORT}`);
});
