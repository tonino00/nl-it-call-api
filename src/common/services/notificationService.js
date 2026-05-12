const Ticket = require('../../models/Ticket');
const Notification = require('../../models/Notification');

exports.createNotification = async ({ userId, type, title, message, data }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    data
  });

  return notification;
};

exports.listNotificationsForUser = async (userId, { unreadOnly = false, limit = 50, page = 1 } = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200);
  const safePage = Math.max(Number(page) || 1, 1);
  const skip = (safePage - 1) * safeLimit;

  const query = { user: userId };
  if (unreadOnly) query.readAt = null;

  const [items, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Notification.countDocuments(query)
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit
  };
};

exports.markNotificationAsRead = async (userId, notificationId) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId, readAt: null },
    { $set: { readAt: new Date() } },
    { new: true }
  ).lean();

  return updated;
};

exports.checkNewNotifications = async (userId, lastCheckTimestamp) => {
  const since = lastCheckTimestamp ? new Date(lastCheckTimestamp) : new Date(Date.now() - 60 * 1000);

  const notifications = await Notification.find({
    user: userId,
    createdAt: { $gt: since }
  })
    .sort({ createdAt: 1 })
    .lean();

  return notifications;
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
