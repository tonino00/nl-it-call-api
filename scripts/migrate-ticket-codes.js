require('dotenv').config();
const mongoose = require('mongoose');

const Ticket = require('../src/models/Ticket');
const Counter = require('../src/models/Counter');

const generateTicketCode = (seq) => {
  return `CHM${String(seq).padStart(6, '0')}`;
};

const main = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('A variável de ambiente MONGODB_URI não está definida');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const maxExisting = await Ticket.findOne({ seq: { $type: 'number' } })
    .sort({ seq: -1 })
    .select('seq')
    .lean();

  let currentSeq = maxExisting && typeof maxExisting.seq === 'number' ? maxExisting.seq : 0;

  const oldTickets = await Ticket.find({
    $or: [
      { code: { $exists: false } },
      { code: null },
      { code: '' }
    ]
  })
    .sort({ createdAt: 1, _id: 1 })
    .select('_id')
    .lean();

  if (oldTickets.length === 0) {
    await Counter.updateOne(
      { _id: 'ticket' },
      { $set: { seq: currentSeq } },
      { upsert: true }
    );

    await mongoose.disconnect();
    return;
  }

  const ops = [];
  for (const t of oldTickets) {
    currentSeq += 1;
    const code = generateTicketCode(currentSeq);

    ops.push({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { seq: currentSeq, code } }
      }
    });
  }

  if (ops.length > 0) {
    await Ticket.bulkWrite(ops, { ordered: true });
  }

  await Counter.updateOne(
    { _id: 'ticket' },
    { $set: { seq: currentSeq } },
    { upsert: true }
  );

  await mongoose.disconnect();
};

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // ignore
  }
  process.exit(1);
});
