const notificationEmailService = require('../common/services/notificationEmailService');

exports.sendTestEmail = async (req, res) => {
  try {
    const to = typeof req.body?.to === 'string' ? req.body.to.trim() : '';
    const subject = typeof req.body?.subject === 'string' ? req.body.subject.trim() : '';
    const html = typeof req.body?.html === 'string' ? req.body.html : '';

    await notificationEmailService.sendTestEmail({ to, subject, html });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar email de teste',
      error: error.message
    });
  }
};
