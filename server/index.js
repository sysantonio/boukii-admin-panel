const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const AUTH_TOKEN = 'secret-token';

// Simple in-memory data
let bookings = [];
let bookingIdCounter = 1;

function authMiddleware(req, res, next) {
  const token = req.headers['authorization'];
  const school = req.headers['x-school-slug'];
  if (!token || token !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized', data: [] });
  }
  if (!school) {
    return res.status(400).json({ success: false, message: 'X-School-Slug header required', data: [] });
  }
  next();
}

function paginate(items, page = 1, perPage = 10) {
  const offset = (page - 1) * perPage;
  const paginatedItems = items.slice(offset, offset + perPage);
  return {
    success: true,
    data: paginatedItems,
    current_page: page,
    per_page: perPage,
    total: items.length,
    message: 'Datos obtenidos exitosamente'
  };
}

app.get('/bookings', authMiddleware, (req, res) => {
  const { status, page = 1, perPage = 10 } = req.query;
  let result = bookings;
  if (status) {
    result = result.filter(b => b.status === status);
  }
  res.json(paginate(result, parseInt(page), parseInt(perPage)));
});

app.get('/bookings/kpis', authMiddleware, (req, res) => {
  const total = bookings.length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const active = total - cancelled;
  res.json({
    success: true,
    data: { total, cancelled, active },
    message: 'KPIs obtenidos exitosamente'
  });
});

app.post('/bookings', authMiddleware, (req, res) => {
  const booking = req.body;
  booking.id = bookingIdCounter++;
  bookings.push(booking);
  res.status(201).json({ success: true, data: booking, message: 'Reserva creada' });
});

app.post('/bookings/smart-create', authMiddleware, (req, res) => {
  const booking = req.body;
  booking.smart = true;
  booking.id = bookingIdCounter++;
  bookings.push(booking);
  res.status(201).json({ success: true, data: booking, message: 'Reserva inteligente creada' });
});

app.patch('/bookings/:id', authMiddleware, (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found', data: [] });
  }
  Object.assign(booking, req.body);
  res.json({ success: true, data: booking, message: 'Reserva actualizada' });
});

app.post('/bookings/:id/cancel', authMiddleware, (req, res) => {
  const booking = bookings.find(b => b.id === parseInt(req.params.id));
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found', data: [] });
  }
  booking.status = 'cancelled';
  booking.status_history = booking.status_history || [];
  booking.status_history.push({ status: 'cancelled', date: new Date().toISOString() });
  res.json({ success: true, data: booking, message: 'Reserva cancelada' });
});

app.get('/clients/smart-search', authMiddleware, (req, res) => {
  const query = req.query.q || '';
  // Dummy search
  const clients = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ].filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  res.json({ success: true, data: clients, message: 'Clientes encontrados' });
});

app.post('/pricing/calculate-dynamic', authMiddleware, (req, res) => {
  const { base_price = 0, extras = 0 } = req.body;
  const total = base_price + extras;
  res.json({ success: true, data: { total }, message: 'Precio calculado' });
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
