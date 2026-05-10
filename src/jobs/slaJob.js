const cron = require('node-cron');

const notificationService = require('../common/services/notificationService');
const notificationEmailService = require('../common/services/notificationEmailService');

const notified = new Map();

const shouldNotify = (ticketId) => {
  const last = notified.get(ticketId);
  const now = Date.now();

  if (!last) {
    notified.set(ticketId, now);
    return true;
  }

  if (now - last > 30 * 60 * 1000) {
    notified.set(ticketId, now);
    return true;
  }

  return false;
};

exports.startSlaJob = () => {
  cron.schedule('*/1 * * * *', async () => {
    try {
      const tickets = await notificationService.checkSLAExpiring();

      for (const ticket of tickets) {
        const id = String(ticket._id);

        const assignedEmail = ticket?.assignedTo?.email;
        if (!assignedEmail) continue;

        if (!shouldNotify(id)) continue;

        try {
          await notificationEmailService.sendSLAAlertEmail(ticket, assignedEmail);
          console.log(`[SLA JOB] Alerta enviado para ${assignedEmail} (ticket ${id})`);
        } catch (err) {
          console.error('[SLA JOB] Falha ao enviar alerta:', err);
        }
      }
    } catch (error) {
      console.error('[SLA JOB] Erro ao executar verificação de SLA:', error);
    }
  });

  console.log('[SLA JOB] Agendado (a cada 1 minuto)');
};
