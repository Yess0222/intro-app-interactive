const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight * 0.8; // Adjust for canvas container height
const window_width = document.querySelector('.canvas-container').offsetWidth; // Adjust for canvas container width

canvas.height = window_height;
canvas.width = window_width;

class Circle {
    constructor(x, y, radius, color, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.originalColor = color;
        this.color = color;
        this.speed = speed;
        this.dx = (Math.random() - 0.5) * this.speed;
        this.dy = (Math.random() - 0.5) * this.speed;
        this.opacity = 1;
        this.fading = false;
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.strokeStyle = "#000"; // Black border for better visibility
        context.lineWidth = 3;
        context.globalAlpha = this.opacity;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.fill();
        context.stroke();
        context.globalAlpha = 1;
    }

    update(context) {
        this.draw(context);
        if (this.fading) {
            this.opacity -= 0.01;
            if (this.opacity <= 0) {
                this.opacity = 0;
                this.fading = false;
            }
        }
        this.posX += this.dx;
        this.posY += this.dy;
        // Keep circles inside the canvas
        if (this.posX + this.radius > window_width) {
            this.posX = window_width - this.radius;
            this.dx = -this.dx;
        }
        if (this.posX - this.radius < 0) {
            this.posX = this.radius;
            this.dx = -this.dx;
        }
        if (this.posY + this.radius > window_height) {
            this.posY = window_height - this.radius;
            this.dy = -this.dy;
        }
        if (this.posY - this.radius < 0) {
            this.posY = window_height + this.radius; // Reset position to bottom if it goes off the top
        }
    }

    checkCollision(otherCircle) {
        const dx = this.posX - otherCircle.posX;
        const dy = this.posY - otherCircle.posY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius + otherCircle.radius;
    }

    handleCollision(otherCircle) {
        if (this.checkCollision(otherCircle)) {
            const angle = Math.atan2(this.posY - otherCircle.posY, this.posX - otherCircle.posX);
            const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            const otherSpeed = Math.sqrt(otherCircle.dx * otherCircle.dx + otherCircle.dy * otherCircle.dy);

            this.dx = Math.cos(angle) * speed;
            this.dy = Math.sin(angle) * speed;
            otherCircle.dx = -Math.cos(angle) * otherSpeed;
            otherCircle.dy = -Math.sin(angle) * otherSpeed;

            const overlap = this.radius + otherCircle.radius - Math.sqrt((this.posX - otherCircle.posX) ** 2 + (this.posY - otherCircle.posY) ** 2);
            const offsetX = Math.cos(angle) * overlap / 2;
            const offsetY = Math.sin(angle) * overlap / 2;
            this.posX += offsetX;
            this.posY += offsetY;
            otherCircle.posX -= offsetX;
            otherCircle.posY -= offsetY;
        }
    }

    changeColorIfMouseOver(mouseX, mouseY) {
        const dx = this.posX - mouseX;
        const dy = this.posY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < this.radius) {
            this.color = "red";
        } else {
            this.color = this.originalColor;
        }
    }

    startFading() {
        this.fading = true;
    }
}

let circles = [];
let totalCircles = 0;
let removedCount = 0;
let level = 1;

const getRandomColor = () => {
    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#F39C12', '#9B59B6', '#E74C3C', '#1ABC9C', '#2980B9', '#8E44AD', '#D35400'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

const createCircles = (count, speedMultiplier) => {
    for (let i = 0; i < count; i++) {
        let randomX = Math.random() * window_width; // Posición aleatoria en el eje X
        let randomY = window_height + (Math.random() * 100); // Posición aleatoria ligeramente por debajo del canvas
        let randomRadius = Math.floor(Math.random() * 50 + 20);
        let randomColor = getRandomColor();
        let circle = new Circle(randomX, randomY, randomRadius, randomColor, speedMultiplier);
        circles.push(circle);
        totalCircles++;
    }
}

createCircles(10, level);

let updateCircles = function () {
    requestAnimationFrame(updateCircles);
    ctx.clearRect(0, 0, window_width, window_height);
    let initialLength = circles.length;
    circles = circles.filter(circle => circle.opacity > 0);
    removedCount += initialLength - circles.length;

    circles.forEach((circle, index) => {
        circle.update(ctx);
        for (let j = index + 1; j < circles.length; j++) {
            circle.handleCollision(circles[j]);
        }
    });

    if (removedCount >= level * 10) {
        level++;
        createCircles(10, level);
    }
    drawRemovedCount();
};

let drawRemovedCount = function() {
    ctx.fillStyle = "#fff"; // White color for visibility
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "20px 'Press Start 2P', cursive"; // Font with video game style
    ctx.fillText(`Removed: ${removedCount}`, 10, 10);
    let percentageRemoved = ((removedCount / totalCircles) * 100).toFixed(2);
    ctx.fillText(`Percentage: ${percentageRemoved}%`, 10, 40);
    ctx.fillText(`Level: ${level}`, 10, 70);
};

canvas.addEventListener("mousemove", function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    circles.forEach(circle => {
        circle.changeColorIfMouseOver(mouseX, mouseY);
    });
});

canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    circles.forEach(circle => {
        const dx = circle.posX - mouseX;
        const dy = circle.posY - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < circle.radius) {
            circle.startFading();
        }
    });
});

updateCircles();
