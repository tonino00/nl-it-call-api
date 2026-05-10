const Ticket = require('../../models/Ticket');

exports.checkNewTickets = async (userId, lastCheckTimestamp) => {
  const since = lastCheckTimestamp ? new Date(lastCheckTimestamp) : new Date(Date.now() - 60 * 1000);

  const query = {
    createdAt: { $gt: since }
  };

  if (userId) {
    query.requester = userId;
  }

  const tickets = await Ticket.find(query)
    .populate('requester', 'name email department')
    .populate('assignedTo', 'name email')
    .populate('category', 'name priority slaTime')
    .sort({ createdAt: 1 });

  return tickets;
};

exports.checkSLAExpiring = async () => {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  const tickets = await Ticket.find({
    dueDate: { $gt: now, $lte: oneHourFromNow },
    status: { $nin: ['resolvido', 'fechado', 'cancelado'] }
  })
    .populate('requester', 'name email department')
    .populate('assignedTo', 'name email')
    .populate('category', 'name priority slaTime')
    .sort({ dueDate: 1 });

  return tickets;
};
