

// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const dotenv = require('dotenv');

// dotenv.config();

// // Import routes
// const authRoutes = require('./routes/authRoutes');
// const categoryRoutes = require('./routes/categoryRoutes');
// const businessRoutes = require('./routes/businessRoutes');
// const favoriteRoutes = require('./routes/favoriteRoutes');
// const reviewRoutes = require('./routes/reviewRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const cityRoutes = require('./routes/cityRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const adminAdsRoutes = require('./routes/adminAdsRoutes'); 
// const newsRoutes = require('./routes/news');


// const exportRouter = require('./routes/exportrouter');

// const app = express();

// // Middleware
// app.use(cors({
//   origin: '*',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(helmet());
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Serve static files
// app.use('/uploads', express.static('uploads'));

// // ==========================================
// // API ROUTES
// // ==========================================
// app.use('/api/auth', authRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/businesses', businessRoutes);
// app.use('/api/favorites', favoriteRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/cities', cityRoutes);
// app.use('/api/news', newsRoutes); 

// // Admin Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/admin', adminAdsRoutes); 

// app.use('/api/admin', exportRouter); 

// // ==========================================
// // SYSTEM ROUTES
// // ==========================================

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Maru Gaam API Server',
//     version: '1.0.0',
//     endpoints: {
//       auth: '/api/auth',
//       categories: '/api/categories',
//       businesses: '/api/businesses',
//       favorites: '/api/favorites',
//       reviews: '/api/reviews',
//       notifications: '/api/notifications',
//       cities: '/api/cities',
//       admin: '/api/admin',
//       news: '/api/news'
//     }
//   });
// });


// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route not found: ${req.method} ${req.originalUrl}`
//   });
// });

// // Global Error handler
// app.use((err, req, res, next) => {
//   console.error('Error:', err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error'
//   });
// });

// module.exports = app;


const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

// ==========================================
// IMPORT ROUTES
// ==========================================
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const businessRoutes = require('./routes/businessRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cityRoutes = require('./routes/cityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAdsRoutes = require('./routes/adminAdsRoutes'); 
const newsRoutes = require('./routes/news'); // 🟢 Standardized naming
const exportRouter = require('./routes/exportrouter');

const app = express();

// ==========================================
// ESSENTIAL MIDDLEWARE
// ==========================================
app.use(helmet()); // Secures HTTP headers
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🟢 CRITICAL: The Debug Logger (See every request in Render Logs)
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Large payload limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));

// ==========================================
// API ROUTING
// ==========================================
// Public & User Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/news',newsRoutes ); 

// Admin Routes (Express will automatically merge these)
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminAdsRoutes); 
app.use('/api/admin', exportRouter); 

// ==========================================
// SYSTEM & HEALTH ROUTES
// ==========================================

// Render/AWS Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root API Directory
app.get('/', (req, res) => {
  res.json({
    message: 'Maru Gaam API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      categories: '/api/categories',
      businesses: '/api/businesses',
      favorites: '/api/favorites',
      reviews: '/api/reviews',
      notifications: '/api/notifications',
      cities: '/api/cities',
      admin: '/api/admin',
      news: '/api/news'
    }
  });
});

// ==========================================
// CRASH-PROOF ERROR HANDLERS
// ==========================================

// 404 handler (Catches bad URLs and returns JSON, not HTML)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error handler (Prevents server crashes on bad code/db drops)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Maru Gaam Backend is LIVE on port ${PORT}`);
});


// If another file requires this (like for testing), you can uncomment below:
module.exports = app;