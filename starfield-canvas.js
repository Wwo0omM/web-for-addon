// Minimal AI Interface Starfield - Canvas Implementation
class MinimalStarfield {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;

        this.resize();
        this.init();
        this.setupEventListeners();
        this.animate();
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    init() {
        // Create 800-1200 stars for dense field
        const starCount = Math.floor(800 + Math.random() * 400);

        for (let i = 0; i < starCount; i++) {
            this.stars.push(this.createStar());
        }
    }

    createStar() {
        // Random position across entire screen
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * Math.max(this.width, this.height);

        const x = this.centerX + Math.cos(angle) * distance;
        const y = this.centerY + Math.sin(angle) * distance;

        // Depth determines speed and size
        const z = Math.random(); // 0 = far, 1 = close

        // 90-95% of stars are tiny (size 0.5-1)
        // 5-10% are slightly brighter (size 1-1.5)
        let size;
        if (Math.random() < 0.93) {
            size = 0.5 + Math.random() * 0.5; // 0.5-1px
        } else {
            size = 1 + Math.random() * 0.5; // 1-1.5px
        }

        // Speed based on depth (closer = faster)
        const baseSpeed = 0.3 + z * 1.2; // 0.3-1.5 pixels per frame

        // Opacity based on depth and size
        const opacity = 0.3 + z * 0.7; // 0.3-1.0

        // Very subtle twinkle
        const twinkleSpeed = 0.001 + Math.random() * 0.002;
        const twinkleOffset = Math.random() * Math.PI * 2;

        return {
            x,
            y,
            z,
            size,
            speed: baseSpeed,
            opacity,
            baseOpacity: opacity,
            twinkleSpeed,
            twinkleOffset,
            angle: Math.atan2(y - this.centerY, x - this.centerX)
        };
    }

    updateStar(star) {
        // Move star outward from center (forward motion effect)
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;

        // Very subtle parallax based on mouse
        const parallaxStrength = star.z * 0.02;
        star.x += this.mouseX * parallaxStrength;
        star.y += this.mouseY * parallaxStrength;

        // Extremely subtle twinkle
        const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinkleOffset) * 0.05;
        star.opacity = star.baseOpacity + twinkle;

        // Check if star is off screen - respawn from center
        const margin = 50;
        if (star.x < -margin || star.x > this.width + margin ||
            star.y < -margin || star.y > this.height + margin) {

            // Respawn near center with slight randomness
            const spawnRadius = 50;
            const spawnAngle = Math.random() * Math.PI * 2;
            star.x = this.centerX + Math.cos(spawnAngle) * spawnRadius;
            star.y = this.centerY + Math.sin(spawnAngle) * spawnRadius;
            star.angle = Math.atan2(star.y - this.centerY, star.x - this.centerX);
        }
    }

    drawStar(star) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        this.ctx.fillRect(
            Math.floor(star.x),
            Math.floor(star.y),
            star.size,
            star.size
        );
    }

    animate() {
        // Smooth mouse interpolation
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

        // Clear canvas
        this.ctx.fillStyle = 'rgba(10, 14, 39, 1)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update and draw all stars
        for (let i = 0; i < this.stars.length; i++) {
            this.updateStar(this.stars[i]);
            this.drawStar(this.stars[i]);
        }

        requestAnimationFrame(() => this.animate());
    }

    setupEventListeners() {
        // Mouse move for subtle parallax
        window.addEventListener('mousemove', (e) => {
            this.targetMouseX = (e.clientX / this.width - 0.5) * 2;
            this.targetMouseY = (e.clientY / this.height - 0.5) * 2;
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.resize();
            // Reinitialize stars on resize
            this.stars = [];
            this.init();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MinimalStarfield('starfield-canvas');
});
