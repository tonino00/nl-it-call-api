const SibApiV3Sdk = require('sib-api-v3-sdk');

const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL;
  return typeof url === 'string' ? url.replace(/\/$/, '') : '';
};

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

const send = async ({ toEmail, toName, subject, html }) => {
  const sender = getSender();
  const instance = getBrevoApiInstance();

  const message = {
    sender,
    to: [{ email: toEmail, ...(toName ? { name: toName } : {}) }],
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

exports.sendPasswordResetEmail = async (email, token, userName) => {
  const frontendUrl = getFrontendUrl();
  if (!frontendUrl) {
    throw new Error('FRONTEND_URL não configurada');
  }

  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  await send({
    toEmail: email,
    toName: userName,
    subject: 'Redefinição de senha',
    html: `
      <p>Olá${userName ? `, ${userName}` : ''}.</p>
      <p>Você solicitou a redefinição da sua senha.</p>
      <p><a href="${resetUrl}">Clique aqui para redefinir sua senha</a></p>
      <p>Se você não solicitou, ignore este e-mail.</p>
    `.trim()
  });
};

exports.sendPasswordChangedNotification = async (email, userName) => {
  try {
    await send({
      toEmail: email,
      toName: userName,
      subject: 'Senha alterada',
      html: `
        <p>Olá${userName ? `, ${userName}` : ''}.</p>
        <p>Sua senha foi alterada com sucesso.</p>
        <p>Se você não reconhece essa ação, entre em contato com o suporte imediatamente.</p>
      `.trim()
    });
  } catch (error) {
    console.error('Erro ao enviar notificação de senha alterada:', error);
  }
};

exports.sendNotificationEmail = async (email, userName, titulo, mensagem) => {
  await send({
    toEmail: email,
    toName: userName,
    subject: titulo,
    html: `
      <p>Olá${userName ? `, ${userName}` : ''}.</p>
      <p>${mensagem}</p>
    `.trim()
  });
};
