
const canvas = document.getElementById("clockCanvas");
const ctx = canvas.getContext("2d");

const radius = canvas.width / 2;
ctx.translate(radius, radius); // Move origin to center

let isDayMode = true; // STATE

// Toggle Button
const toggleBtn = document.getElementById("modeToggle");
document.body.classList.add("day");

toggleBtn.addEventListener("click", () => {
    isDayMode = !isDayMode;

    if (isDayMode) {
        document.body.classList.remove("night");
        document.body.classList.add("day");
        toggleBtn.textContent = "Switch to Night Mode";
    } else {
        document.body.classList.remove("day");
        document.body.classList.add("night");
        toggleBtn.textContent = "Switch to Day Mode";
    }
});


// MAIN ANIMATION LOOP (requestAnimationFrame)
function drawClock() {
    ctx.clearRect(-radius, -radius, canvas.width, canvas.height);

    drawFace();
    drawNumbers();
    drawTime();

    requestAnimationFrame(drawClock); // REQUIRED
}


// DRAW CLOCK FACE
function drawFace() {
    ctx.beginPath();
    ctx.arc(0, 0, radius - 5, 0, 2 * Math.PI);

    ctx.fillStyle = isDayMode ? "#ffffff" : "#1e1e1e";
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = isDayMode ? "#333" : "#ddd";
    ctx.stroke();

    ctx.closePath();
}


// DRAW NUMBERS
function drawNumbers() {
    ctx.font = "18px Arial";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = isDayMode ? "#000" : "#fff";

    for (let num = 1; num <= 12; num++) {
        let angle = num * Math.PI / 6;

        let x = Math.sin(angle) * (radius - 30);
        let y = -Math.cos(angle) * (radius - 30);

        ctx.fillText(num.toString(), x, y);
    }
}

// DRAW HANDS
function drawTime() {
    const now = new Date();

    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();

    // Hour
    hour = hour % 12;
    hour = (hour * Math.PI / 6) +
           (minute * Math.PI / (6 * 60)) +
           (second * Math.PI / (360 * 60));

    drawHand(hour, radius * 0.5, 6);

    // Minute
    minute = (minute * Math.PI / 30) +
             (second * Math.PI / (30 * 60));

    drawHand(minute, radius * 0.75, 4);

    // Second
    second = (second * Math.PI / 30);

    drawHand(second, radius * 0.9, 2, "red");
}


// GENERIC HAND DRAWER (TRIGONOMETRY)
function drawHand(pos, length, width, color = null) {
    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = "round";

    ctx.strokeStyle = color
        ? color
        : (isDayMode ? "#000" : "#fff");

    ctx.moveTo(0, 0);

    let x = Math.sin(pos) * length;
    let y = -Math.cos(pos) * length;

    ctx.lineTo(x, y);
    ctx.stroke();
}


// START ENGINE
drawClock();