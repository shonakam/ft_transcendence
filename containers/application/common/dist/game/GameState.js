/**
 * GameState.ts
 */
import { Ball } from './Ball';
import { Paddle } from './Paddle';
import CONFIG from './GameConfig';
export class GameState {
    // BasicStatus
    status = 'ready';
    winner = null;
    playerSide = 'both';
    onStatusChange = () => { };
    // Game user info
    leftUserAliasName = null;
    rightUserAliasName = null;
    // Scores
    scores = [0, 0];
    onScoreChange = () => { };
    // Game field state
    paddles = [new Paddle('left'), new Paddle('right')];
    ball = new Ball();
    // Game Config
    config = CONFIG;
    constructor() { }
    setStatus(status) {
        this.status = status;
        this.onStatusChange(status);
    }
    incrementScore(side) {
        if (side === 'left')
            this.scores[0]++;
        else if (side === 'right')
            this.scores[1]++;
        if (this.onScoreChange)
            this.onScoreChange(this.scores[0], this.scores[1]);
        if (this.scores[0] < this.config.WINNING_SCORE &&
            this.scores[1] < this.config.WINNING_SCORE)
            return false;
        if (this.scores[0] >= this.config.WINNING_SCORE)
            this.winner = 'left';
        else if (this.scores[1] >= this.config.WINNING_SCORE)
            this.winner = 'right';
        this.setStatus('finished');
        return true;
    }
    jsonify() {
        return {
            status: this.status,
            winner: this.winner,
            playerSide: this.playerSide,
            leftUserAliasName: this.leftUserAliasName,
            rightUserAliasName: this.rightUserAliasName,
            scores: this.scores,
            paddles: this.paddles.map((paddle) => paddle.jsonify()),
            ball: this.ball.jsonify(),
            config: this.config,
        };
    }
}
