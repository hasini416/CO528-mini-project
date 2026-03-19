require('dotenv').config();
const { server } = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DECP Backend running on port ${PORT}`);
    console.log(`   ENV: ${process.env.NODE_ENV}`);
    console.log(`   Local:   http://localhost:${PORT}`);
    console.log(`   Network: http://192.168.8.135:${PORT}`);
  });
});
