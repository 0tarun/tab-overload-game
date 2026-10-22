"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const highscores_1 = require("./routes/highscores");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 4000;
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim());
app.use((0, cors_1.default)({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Origin is not allowed by CORS.'));
    },
}));
app.use(express_1.default.json({ limit: '10kb' }));
app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok' });
});
app.use('/api/highscores', highscores_1.highscoreRouter);
const errorHandler = (error, _request, response, _next) => {
    console.error('Unhandled API error:', error);
    response.status(500).json({ error: 'An unexpected server error occurred.' });
};
app.use(errorHandler);
app.listen(port, () => {
    console.info(`Tab Overload API listening on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map