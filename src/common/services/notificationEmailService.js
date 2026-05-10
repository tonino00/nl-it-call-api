const SibApiV3Sdk = require('sib-api-v3-sdk');

const getBrevoApiKey = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (typeof apiKey === 'string' && apiKey.trim()) return apiKey.trim();
  throw new Error('BREVO_API_KEY não configurada');
};

const getSender = () => {
  const email = process.env.BREVO_FROM_EMAIL;
  const name = process.env.BREVO_FROM_NAME || 'NL IT Call';

  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('BREVO_FROM_EMAIL não configurada (remetente precisa estar verificado na Brevo)');
  }

  return {
    email: email.trim(),
    name: typeof name === 'string' && name.trim() ? name.trim() : 'NL IT Call'
  };
};

let apiInstance;
const getBrevoApiInstance = () => {
  if (apiInstance) return apiInstance;

  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications['api-key'].apiKey = getBrevoApiKey();
  apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  return apiInstance;
};

const normalizeTo = (to) => {
  if (Array.isArray(to)) {
    return to
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean)
      .map((email) => ({ email }));
  }

  const email = typeof to === 'string' ? to.trim() : '';
  return email ? [{ email }] : [];
};

const sendMail = async ({ to, subject, html }) => {
  const sender = getSender();
  const instance = getBrevoApiInstance();

  const toList = normalizeTo(to);
  if (toList.length === 0) {
    throw new Error('Destinatário (to) inválido');
  }

  const message = {
    sender,
    to: toList,
    subject,
    htmlContent: html
  };

  try {
    await instance.sendTransacEmail(message);
  } catch (error) {
    const details = error?.response?.body || error?.response?.text || error;
    console.error('Erro Brevo:', details);
    throw error;
  }
};

exports.sendNewTicketEmail = async (ticket, supportTeamEmails) => {
  if (!Array.isArray(supportTeamEmails) || supportTeamEmails.length === 0) {
    throw new Error('supportTeamEmails vazio');
  }

  const code = ticket?.code ? ` (${ticket.code})` : '';

  await sendMail({
    to: supportTeamEmails,
    subject: `Novo chamado${code}: ${ticket.title}`,
    html: `
      <p>Um novo chamado foi criado.</p>
      <p><strong>Título:</strong> ${ticket.title}</p>
      <p><strong>Descrição:</strong> ${ticket.description}</p>
      <p><strong>Prioridade:</strong> ${ticket.priority}</p>
      <p><strong>Vencimento (SLA):</strong> ${ticket.dueDate ? new Date(ticket.dueDate).toLocaleString('pt-BR') : 'N/A'}</p>
    `.trim()
  });
};

exports.sendSLAAlertEmail = async (ticket, assignedToEmail) => {
  if (!assignedToEmail) {
    throw new Error('assignedToEmail não informado');
  }

  const code = ticket?.code ? ` (${ticket.code})` : '';

  await sendMail({
    to: assignedToEmail,
    subject: `Alerta de SLA${code}: ${ticket.title}`,
    html: `
      <p>O SLA deste chamado está prestes a expirar (menos de 1 hora).</p>
      <p><strong>Título:</strong> ${ticket.title}</p>
      <p><strong>Status:</strong> ${ticket.status}</p>
      <p><strong>Vencimento (SLA):</strong> ${ticket.dueDate ? new Date(ticket.dueDate).toLocaleString('pt-BR') : 'N/A'}</p>
    `.trim()
  });
};

exports.sendTestEmail = async ({ to, subject, html }) => {
  if (!to || !subject || !html) {
    throw new Error('to, subject e html são obrigatórios');
  }

  await sendMail({ to, subject, html });
};
