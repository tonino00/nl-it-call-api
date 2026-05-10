const notificationService = require('../common/services/notificationService');

const parseUserIdFromQuery = (req) => {
  const userId = typeof req.query?.userId === 'string' ? req.query.userId.trim() : '';
  return userId || null;
};

exports.streamNotifications = async (req, res) => {
  const requestedUserId = parseUserIdFromQuery(req);

  const isRegularUser = req.user.role === 'user';
  const effectiveUserId = isRegularUser ? String(req.user.id) : null;

  if (requestedUserId && isRegularUser && String(req.user.id) !== String(requestedUserId)) {
    return res.status(403).json({
      success: false,
      message: 'Você não tem permissão para abrir stream para outro usuário'
    });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  let lastCheckTimestamp = Date.now();
  const slaSentTicketIds = new Set();

  const writeEvent = (eventName, payload) => {
    try {
      res.write(`event: ${eventName}\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      console.error('Erro ao escrever SSE:', err);
    }
  };

  const keepAliveInterval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (err) {
      console.error('Erro no keep-alive SSE:', err);
    }
  }, 25000);

  const newTicketsInterval = setInterval(async () => {
    try {
      const tickets = await notificationService.checkNewTickets(effectiveUserId, lastCheckTimestamp);

      if (Array.isArray(tickets) && tickets.length) {
        for (const ticket of tickets) {
          writeEvent('new_ticket', ticket);
        }
      }

      lastCheckTimestamp = Date.now();
    } catch (error) {
      console.error('Erro ao verificar novos tickets (SSE):', error);
      writeEvent('error', { message: 'Erro ao verificar novos tickets' });
    }
  }, 5000);

  const slaInterval = setInterval(async () => {
    try {
      const tickets = await notificationService.checkSLAExpiring();

      if (Array.isArray(tickets) && tickets.length) {
        for (const ticket of tickets) {
          const id = String(ticket._id);
          if (slaSentTicketIds.has(id)) continue;
          slaSentTicketIds.add(id);
          writeEvent('sla_warning', ticket);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar SLA (SSE):', error);
      writeEvent('error', { message: 'Erro ao verificar SLA' });
    }
  }, 60000);

  req.on('close', () => {
    clearInterval(newTicketsInterval);
    clearInterval(slaInterval);
    clearInterval(keepAliveInterval);
    res.end();
  });
};
