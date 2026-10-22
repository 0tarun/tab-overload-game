"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.highscoreRouter = void 0;
const node_crypto_1 = require("node:crypto");
const express_1 = require("express");
const highscores = [];
exports.highscoreRouter = (0, express_1.Router)();
exports.highscoreRouter.get('/', (_request, response) => {
    response.json([...highscores]
        .sort((first, second) => second.timeRemaining - first.timeRemaining
        || first.createdAt.localeCompare(second.createdAt))
        .slice(0, 10));
});
exports.highscoreRouter.post('/', (request, response) => {
    const body = request.body;
    if (!isHighscoreSubmission(body)) {
        response.status(400).json({
            error: 'Provide a playerName (1-24 characters), timeRemaining (0-120), and completed workProgress (100).',
        });
        return;
    }
    const score = {
        id: (0, node_crypto_1.randomUUID)(),
        playerName: body.playerName.trim(),
        timeRemaining: body.timeRemaining,
        workProgress: body.workProgress,
        createdAt: new Date().toISOString(),
    };
    highscores.push(score);
    const rank = [...highscores]
        .sort((first, second) => second.timeRemaining - first.timeRemaining
        || first.createdAt.localeCompare(second.createdAt))
        .findIndex((entry) => entry.id === score.id) + 1;
    response.status(201).json({ ...score, rank });
});
function isHighscoreSubmission(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    const candidate = value;
    return typeof candidate.playerName === 'string'
        && candidate.playerName.trim().length > 0
        && candidate.playerName.trim().length <= 24
        && typeof candidate.timeRemaining === 'number'
        && Number.isInteger(candidate.timeRemaining)
        && candidate.timeRemaining >= 0
        && candidate.timeRemaining <= 120
        && candidate.workProgress === 100;
}
//# sourceMappingURL=highscores.js.map