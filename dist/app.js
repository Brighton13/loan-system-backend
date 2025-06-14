"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const auth_1 = __importDefault(require("./routes/auth"));
const loans_1 = __importDefault(require("./routes/loans"));
const admin_1 = __importDefault(require("./routes/admin"));
require("./models/index");
const index_1 = require("./models/index");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
// Custom request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log request info
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${req.ip}`);
    // Override res.end to log response info
    const originalEnd = res.end;
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(limiter);
app.use(requestLogger); // Add request logging
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/loans', loans_1.default);
app.use('/api/admin', admin_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling middleware with source information
app.use((err, req, res, next) => {
    // Log Sequelize errors with source info
    if (err.name && (err.name.includes('Sequelize') || err.sql)) {
        console.error(`[SEQUELIZE ERROR] ${new Date().toISOString()}`);
        console.error(`Route: ${req.method} ${req.originalUrl}`);
        console.error(`IP: ${req.ip}`);
        console.error(`Error: ${err.message}`);
        console.error(`Stack: ${err.stack}`);
        if (err.sql) {
            console.error(`Failed Query: ${err.sql}`);
        }
    }
    else {
        // Log other errors
        console.error(`[API ERROR] ${new Date().toISOString()}`);
        console.error(`Route: ${req.method} ${req.originalUrl}`);
        console.error(`IP: ${req.ip}`);
        console.error(`Error: ${err.message}`);
        console.error(`Stack: ${err.stack}`);
    }
    res.status(500).json({ error: 'Something went wrong!' });
});
// 404 handler
app.use('*', (req, res) => {
    console.log(`[404] ${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}`);
    res.status(404).json({ error: 'Route not found' });
});
// Database connection and server start
const startServer = async () => {
    try {
        await database_1.default.authenticate();
        console.log('Database connection established successfully.');
        // Sync database (create tables)
        await database_1.default.sync({ force: false });
        (0, index_1.setupAssociations)();
        console.log('Database synchronized.');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=app.js.map