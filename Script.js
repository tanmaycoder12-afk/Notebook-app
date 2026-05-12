const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

// Proper sizing
canvas.width = window.innerWidth;
canvas.style.width = window.innerWidth + "px";
canvas.height = 2000; // initial long page

// Important for touch
canvas.style.touchAction = "none";

// State
let drawing = false;
let color = "black";
let size = 3;
let erasing = false;

let strokes = [];
let currentStroke = [];
let undoneStrokes = [];

let currentPage = 1;

let lastY = 0;

canvas.addEventListener("pointermove", (e) => {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // detect vertical scroll intent
  if (Math.abs(y - lastY) > 50 && e.pressure === 0) {
    return; // allow scroll
  }

  lastY = y;

  currentStroke.push({ x, y, color, size, erase: erasing });

  drawAllStrokes();
});

canvas.addEventListener("pointerdown", () => {
  document.querySelector(".canvas-container").style.overflow = "hidden";
});

canvas.addEventListener("pointerup", () => {
  document.querySelector(".canvas-container").style.overflow = "scroll";
});

// ---------------- DRAWING ----------------

canvas.addEventListener("pointerdown", (e) => {
  drawing = true;
  currentStroke = [];
});

canvas.addEventListener("pointermove", (e) => {
  if (!drawing) return;

  const rect = canvas.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (y > canvas.height - 200) {
     canvas.height += 1000; // extend page
     canvas.style.height = canvas.height + "px";
     
  }

  currentStroke.push({
    x,
    y,
    color,
    size,
    erase: erasing
  });

  drawAllStrokes();
});

canvas.addEventListener("pointerup", () => {
  drawing = false;

  if (currentStroke.length > 0) {
    strokes.push(currentStroke);
    undoneStrokes = [];
    saveNote();
  }
});

// ---------------- DRAW FUNCTION ----------------

function drawAllStrokes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let stroke of strokes) {
    ctx.beginPath();

    for (let i = 0; i < stroke.length; i++) {
      let p = stroke[i];

      ctx.lineWidth = p.size;
      ctx.lineCap = "round";

      if (p.erase) {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = p.color;
      }

      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }

    ctx.stroke();
  }

  // Draw current stroke
  if (currentStroke.length > 0) {
    ctx.beginPath();

    for (let i = 0; i < currentStroke.length; i++) {
      let p = currentStroke[i];

      ctx.lineWidth = p.size;
      ctx.lineCap = "round";

      if (p.erase) {
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = p.color;
      }

      if (i === 0) {
        ctx.moveTo(p.x, p.y);
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }

    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
}

// ---------------- CONTROLS ----------------

function setColor(c) {
  color = c;
  erasing = false;
}

function setSize(s) {
  size = s;
}

function toggleEraser() {
  erasing = !erasing;
  const btn = document.querySelector('button[onclick="toggleEraser()"]');
  if (erasing) {
    btn.classList.add('active-eraser');
  } else {
    btn.classList.remove('active-eraser');
  }
}

function clearCanvas() {
  strokes = [];
  undoneStrokes = [];
  drawAllStrokes();
  saveNote();
}

// ---------------- UNDO / REDO ----------------

function undo() {
  if (strokes.length > 0) {
    undoneStrokes.push(strokes.pop());
    drawAllStrokes();
    saveNote();
  }
}

function redo() {
  if (undoneStrokes.length > 0) {
    strokes.push(undoneStrokes.pop());
    drawAllStrokes();
    saveNote();
  }
}

// ---------------- SAVE / LOAD ----------------

function saveNote() {
  localStorage.setItem(
    "note_" + currentPage,
    JSON.stringify(strokes)
  );
}

function loadNote() {
  let data = localStorage.getItem("note_" + currentPage);

  if (!data) {
    strokes = [];
    drawAllStrokes();
    return;
  }

  strokes = JSON.parse(data);
  drawAllStrokes();
}

// ---------------- PAGES ----------------

function nextPage() {
  saveNote();
  currentPage++;
  loadNote();
  updatePageDisplay();
}

function prevPage() {
  if (currentPage > 1) {
    saveNote();
    currentPage--;
    loadNote();
    updatePageDisplay();
  }
}

function updatePageDisplay() {
  document.getElementById("pageNum").innerText =
    "Page " + currentPage;
}

function setColor(c) {
  color = c;
  erasing = false;
}

// Load first page
loadNote();
