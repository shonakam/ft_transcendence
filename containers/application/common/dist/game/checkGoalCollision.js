export function checkGoalCollision(ball, canvasWidth) {
    const ballLeft = ball.position.x - ball.radius;
    const ballRight = ball.position.x + ball.radius;
    const leftGoalX = 0;
    const rightGoalX = canvasWidth;
    if (leftGoalX < ballLeft && ballRight < rightGoalX)
        return 'none';
    else if (ballLeft <= leftGoalX)
        return 'right';
    else
        return 'left'; // if (rightGoalX <= ballRight)
}
