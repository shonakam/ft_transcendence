interface Ball {
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    size: number;
    color: string;
    baseSpeedX: number;
    baseSpeedY: number;
}

interface GameState {
    startTime: number;
    lastSpeedIncrease: number;
}

interface Score {
    player1: number;
    player2: number;
}

interface Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}

const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

const leftPaddle: Paddle = {
    x: 20,
    y: ctx.canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 5
};

const rightPaddle: Paddle = {
    x: ctx.canvas.width - 30,
    y: ctx.canvas.height / 2 - 50,
    width: 10,
    height: 100,
    speed: 5
};

const ball: Ball = {
    x: ctx.canvas.width / 2,
    y: ctx.canvas.height / 2,
    velocityX: 2,
    velocityY: 1,
    size: 20,
    color: 'orange',
    baseSpeedX: 2,
    baseSpeedY: 1,
};

const score: Score = {
    player1: 0,
    player2: 0
};

const gameState: GameState = {
    startTime: Date.now(),
    lastSpeedIncrease: Date.now()
};

function clearCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function updateScoreDisplay(score: Score): void {
    const playerScoreElement = document.getElementById('playerScore');
    const aiScoreElement = document.getElementById('aiScore');
    
    if (playerScoreElement) {
        playerScoreElement.textContent = score.player1.toString();
    }
    if (aiScoreElement) {
        aiScoreElement.textContent = score.player2.toString();
    }
}

function resetBall(ball: Ball, ctx: CanvasRenderingContext2D, gameState: GameState): void {
    ball.x = ctx.canvas.width / 2;
    ball.y = ctx.canvas.height / 2;
    
    // 基本速度にリセット
    ball.velocityX = ball.baseSpeedX * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = ball.baseSpeedY * (Math.random() - 0.5) * 2;
    
    // タイマーリセット
    gameState.startTime = Date.now();
    gameState.lastSpeedIncrease = Date.now();
}

function updateBall(ball: Ball, ctx: CanvasRenderingContext2D, score?: Score): void {
    const currentTime = Date.now();
    if (currentTime - gameState.lastSpeedIncrease > 1000) {
        ball.velocityX *= 1.05;
        ball.velocityY *= 1.05;
        gameState.lastSpeedIncrease = currentTime;
    }
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

     // 左パドルの衝突判定（修正版）
    if (ball.velocityX < 0 && // 左に向かっている時のみ
        ball.x - ball.size <= leftPaddle.x + leftPaddle.width &&
        ball.x - ball.size > leftPaddle.x &&
        ball.y + ball.size > leftPaddle.y &&
        ball.y - ball.size < leftPaddle.y + leftPaddle.height) {
        
        ball.velocityX = -ball.velocityX;
        ball.x = leftPaddle.x + leftPaddle.width + ball.size; // 正確な位置修正
    }
    
    // 右パドルの衝突判定
    if (ball.velocityX > 0 && // 右に向かっている時のみ
        ball.x + ball.size >= rightPaddle.x &&
        ball.x + ball.size < rightPaddle.x + rightPaddle.width &&
        ball.y + ball.size > rightPaddle.y &&
        ball.y - ball.size < rightPaddle.y + rightPaddle.height) {
        
        ball.velocityX = -ball.velocityX;
        ball.x = rightPaddle.x - ball.size; // 正確な位置修正
    }

    // 左右の壁での反射とスコア処理
    if (ball.x + ball.size > ctx.canvas.width) {
        if (score ) {
            score.player1++;
            updateScoreDisplay(score);
            resetBall(ball, ctx, gameState);
            return;
        } else {
            ball.velocityX = -Math.abs(ball.velocityX); // 確実に左向きに
        }
    }
    
    if (ball.x - ball.size < 0) {
        if (score ) {
            score.player2++;
            updateScoreDisplay(score);
            resetBall(ball, ctx, gameState);
            return;
        } else {
            ball.velocityX = Math.abs(ball.velocityX); // 確実に右向きに
        }
    }

    // 上下の壁での反射
    if (ball.y + ball.size > ctx.canvas.height || ball.y - ball.size < 0) {
        ball.velocityY *= -1;
    }

    // 速度制限（オプション）
    const maxSpeed = 8;
    ball.velocityX = Math.max(-maxSpeed, Math.min(maxSpeed, ball.velocityX));
    ball.velocityY = Math.max(-maxSpeed, Math.min(maxSpeed, ball.velocityY));
}

function drawBall(ball: Ball, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
}

const keys: { [key: string]: boolean } = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function updatePaddles() {
    // 左パドル (W/S)
    if (keys['w'] && leftPaddle.y > 0) {
        leftPaddle.y -= leftPaddle.speed;
    }
    if (keys['s'] && leftPaddle.y < ctx.canvas.height - leftPaddle.height) {
        leftPaddle.y += leftPaddle.speed;
    }
    
    // 右パドル (矢印キー)
    if (keys['ArrowUp'] && rightPaddle.y > 0) {
        rightPaddle.y -= rightPaddle.speed;
    }
    if (keys['ArrowDown'] && rightPaddle.y < ctx.canvas.height - rightPaddle.height) {
        rightPaddle.y += rightPaddle.speed;
    }
}

function drawPaddle(paddle: Paddle, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'white';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function animate(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, score: Score): void {
    clearCanvas(canvas, ctx);
    drawHockeyTable(ctx);
    drawBall(ball, ctx);
    drawPaddle(leftPaddle, ctx);
    drawPaddle(rightPaddle, ctx);
    updateBall(ball, ctx, score);
    updatePaddles();
    if (score.player1 >= 3 || score.player2 >= 3) {
        return; // ゲーム終了
    }
    requestAnimationFrame(() => animate(canvas, ctx, score));
}

function drawHockeyTable(ctx: CanvasRenderingContext2D): void {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    
    // 背景色（緑のホッケーテーブル）
    ctx.fillStyle = '#003300';
    ctx.fillRect(0, 0, width, height);
    
    // 中央線
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    
    // 中央円
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 50, 0, Math.PI * 2);
    ctx.stroke();
    
    // ゴールエリア（左）
    ctx.beginPath();
    ctx.arc(0, height / 2, 80, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    
    // ゴールエリア（右）
    ctx.beginPath();
    ctx.arc(width, height / 2, 80, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();
    
    // コーナーアーク（左上）
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI / 2);
    ctx.stroke();
    
    // コーナーアーク（右上）
    ctx.beginPath();
    ctx.arc(width, 0, 30, Math.PI / 2, Math.PI);
    ctx.stroke();
    
    // コーナーアーク（左下）
    ctx.beginPath();
    ctx.arc(0, height, 30, -Math.PI / 2, 0);
    ctx.stroke();
    
    // コーナーアーク（右下）
    ctx.beginPath();
    ctx.arc(width, height, 30, Math.PI, -Math.PI / 2);
    ctx.stroke();
}

resetBall(ball, ctx, gameState);
updateScoreDisplay(score);
drawHockeyTable(ctx);
animate(canvas, ctx, score);
