const images = [
    "apple.jpg",
    "bowling.png",
    "bunny.png",
    "duck.png",
    "flower.png",
    "hand.png",
    "pineapple.jpg",
    "strawberry.jpg",
    "sunset.png",
    "tree.png",
];

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const reference = document.querySelector("#reference");
const imageInfo = document.querySelector("#image-info");
const saveStatus = document.querySelector("#save-status");
const newBtn = document.querySelector("#new-btn");
const artBtn = document.querySelector("#art-btn");
const clearBtn = document.querySelector("#clear-btn");
const saveBtn = document.querySelector("#save-btn");
const loadBtn = document.querySelector("#load-btn");
const timerDisplay = document.querySelector("#timer-display");
const timerToggle = document.querySelector("#timer-toggle");

let drawing = false;
let currentName = "";
let timeLeft = 0;
let timerActive = false;
let timerInterval = null;
let timerEnabled = false;

// Pick a random local image
function newImage() {
    const src = images[Math.floor(Math.random() * images.length)];
    reference.src = src;
    currentName = src.substring(0, src.indexOf("."));
    imageInfo.textContent = "";
    clearCanvas();
    startTimer();
}

// Get a random piece of art from the Art Institute of Chicago Data API
// https://api.artic.edu/docs/#images
async function newArtwork() {
    imageInfo.textContent = "";
    const page = Math.floor(Math.random() * 20) + 1;
    const res = await fetch(`https://api.artic.edu/api/v1/artworks/search?q=landscape&query[term][is_public_domain]=true&fields=id,title,artist_display,image_id&page=${page}&limit=1`);
    if (!res.ok) {
        imageInfo.textContent = "Failed to fetch artwork.";
        return;
    }
    const data = await res.json();
    const artwork = data.data[0];
    if (!artwork.image_id) {
        imageInfo.textContent = "No image available. Try again.";
        return;
    }
    reference.src = `https://www.artic.edu/iiif/2/${artwork.image_id}/full/400,/0/default.jpg`;
    currentName = artwork.title;
    clearCanvas();
    startTimer();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Save drawing and reference to localStorage Browser API
function saveDrawing() {
    localStorage.setItem("drawingData", canvas.toDataURL());
    localStorage.setItem("referenceImage", reference.src);
    localStorage.setItem("referenceName", currentName);
    saveStatus.textContent = `Saved drawing of "${currentName}"`;
}

function startTimer() {
    if (!timerEnabled) return;
    if (timerInterval) clearInterval(timerInterval);
    timeLeft = 30;
    timerActive = true;
    timerDisplay.textContent = "30s";
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft + "s";
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerActive = false;
            drawing = false;
            timerDisplay.textContent = "Time's up!";
        }
    }, 1000);
}

// Referenced: https://www.geeksforgeeks.org/html/how-to-draw-with-mouse-in-html-5-canvas/
// as well as inspecting the class page on Canvas Browser API 
canvas.addEventListener("mousedown", (e) => {
    if (timerActive === false && timerDisplay.textContent === "Time's up!") return;
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", (e) => {
    if (!drawing) return;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
});

canvas.addEventListener("mouseleave", () => {
    drawing = false;
});


timerToggle.addEventListener("click", () => {
    timerEnabled = !timerEnabled;
    timerToggle.textContent = timerEnabled ? "Timer Enabled" : "Timer Disabled";
    // make sure to clear the interval again 
    if (!timerEnabled) {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
        timerActive = false;
        timerDisplay.textContent = "";
    }
});

newBtn.addEventListener("click", newImage);
artBtn.addEventListener("click", newArtwork);
clearBtn.addEventListener("click", clearCanvas);
saveBtn.addEventListener("click", saveDrawing);
loadBtn.addEventListener("click", () => {
    const savedDrawing = localStorage.getItem("drawingData");
    const savedRef = localStorage.getItem("referenceImage");
    const savedName = localStorage.getItem("referenceName");
    if (savedRef) reference.src = savedRef;
    if (savedName) {
        currentName = savedName;
    }
    if (!savedDrawing) return;
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = savedDrawing;
});

newImage();
