
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'BeautyTech API is running 💗' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected',
  });
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Chưa cấu hình MONGODB_URI trong file .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Đã kết nối MongoDB Atlas');

  app.listen(3000, '0.0.0.0', () => {
    console.log('💗 API chạy tại http://localhost:3000');
  });
}

startServer().catch((error) => {
  console.error('❌ Lỗi kết nối:', error.message);
  process.exit(1);
});
