let table;
let validRows = [];
let hoveredBarIndex = null;
let hoveredCircleIndex = null;

function preload() {
  table = loadTable('dataset.csv', 'csv', 'header');
}

function setup() {
  let canvasHeight = 900 + ValidRows().length * 5; // altezza dinamica
  createCanvas(windowWidth, canvasHeight);
  validRows = ValidRows();
}

function draw() {
  background(245);
  drawHeader();
  drawGraph1();
  drawText2();
  drawText3();
  drawGraph2();
  drawText4();
  drawText5();
}

function windowResized() {
  resizeCanvas(windowWidth, height); // mantiene altezza dinamica
}

// Estrai righe valide
function ValidRows() {
  let result = [];
  for (let i = 0; i < table.getRowCount(); i++) {
    let column2 = table.getNum(i, 2);
    let column3 = table.getNum(i, 3);
    if (column2 > 60 && column3 % 3 === 0) {
      result.push(table.getRow(i));
    }
  }
  return result;
}

//  Funzioni statistiche
function Mean(column) {
  let sum = 0;
  for (let i = 0; i < validRows.length; i++) {
    sum += validRows[i].getNum(column);
  }
  return sum / validRows.length;
}

function StandardDeviation(column) {
  let mean = Mean(column);
  let sum = 0;
  for (let i = 0; i < validRows.length; i++) {
    sum += Math.pow(validRows[i].getNum(column) - mean, 2);
  }
  return Math.sqrt(sum / validRows.length);
}

function Mode(column) {
  let values = [];
  for (let i = 0; i < validRows.length; i++) {
    let value = validRows[i].getNum(column);
    values[value] = (values[value] || 0) + 1;
  }
  let mode = null;
  let maxCount = 0;
  for (let value in values) {
    if (values[value] > maxCount) {
      maxCount = values[value];
      mode = value;
    }
  }
  return mode;
}

function Median(column) {
  let values = [];
  for (let i = 0; i < validRows.length; i++) {
    values.push(validRows[i].getNum(column));
  }
  values.sort((a, b) => a - b);
  let n = values.length;
  return n % 2 === 0
    ? (values[n / 2 - 1] + values[n / 2]) / 2
    : values[Math.floor(n / 2)];
}

// Header
function drawHeader() {
  push();
  fill(0);
  textFont('helvetica neue');
  textAlign(LEFT, TOP);
  textSize(12);
  text("POLITECNICO DI MILANO – DDC \nCOMPUTER GRAFICA PER L'INFORMATION DESIGN", 30, 17);
  textAlign(RIGHT, TOP);
  text("10963955\nANAZCO RIOFRIO EMLY NOELIA", width - 30, 17);
  textAlign(CENTER, TOP);
  textSize(32);
  textStyle(BOLD);
  text("DATASET ANALYSIS", width / 2, 16);
  stroke(0);
  strokeWeight(1);
  line(15, 60, width - 15, 60);
  pop();

  // Descrizione
  push();
  fill(0);
  textSize(16);
  textAlign(LEFT, TOP);
  text("First assignment's goal is the following:\n" +
       "1. Parse the file, find the valid rows (the ones for which both rules are satisfied).\n" +
       "2. Create a GitHub page that displays using p5.js the following information:\n" +
       "    - Mean of the first column \n" +
       "    - Standard deviation of the second column\n" +
       "    - Mode of the third column\n" +
       "    - Median of the fourth column\n" +
       "    - Mean and standard deviation of the fifth column\n" +
       "3. Provide two graphical and two textual representations. The fifth and final representation is up to you.\n\n" +
       "The rules were:\n" +
       "1. column3 multiple of 3\n" +
       "2. column2 > 60\n\n\n" +
       "RESULTS\n", 30, 90);
  pop();
}

// Grafico colonna 0

function drawGraph1() {
  let mean0 = Mean(0);
  let values = validRows.map(row => row.getNum(0));
  let maxVal = Math.max(...values);
  let minVal = Math.min(...values);

  let graphX = 60;
  let graphY = 635;
  let graphHeight = 200;
  let barWidth = 7;
  let barSpacing = 1;
  let totalBarSpace = barWidth + barSpacing;

  push();
  translate(graphX, graphY);

  // Assi e griglia
  stroke(180);
  line(0, 0, values.length * totalBarSpace, 0);
  line(0, -graphHeight, 0, graphHeight);

  textSize(12);
  textAlign(RIGHT, CENTER);
  fill(50);
  for (let v = minVal; v <= maxVal; v += (maxVal - minVal) / 4) {
    let y = -map(v, minVal, maxVal, -graphHeight, graphHeight);
    stroke(220);
    line(0, y, values.length * totalBarSpace, y);
    noStroke();
    text(v.toFixed(0), -10, y);
  }

  // Barre con gradiente viola e angoli smussati verso l’esterno
  for (let i = 0; i < values.length; i++) {
    let val = values[i];
    let h = map(Math.abs(val), 0, Math.max(Math.abs(minVal), Math.abs(maxVal)), 0, graphHeight);
    let x = i * totalBarSpace;

    let grad = drawingContext.createLinearGradient(x, 0, x, h);
    grad.addColorStop(0, '#B060E0');
    grad.addColorStop(1, '#5A1A90');
    drawingContext.fillStyle = grad;

    noStroke();
    if (val >= 0) {
      rect(x, -h, barWidth, h, 4, 4, 0, 0); // smussati sopra
    } else {
      rect(x, 0, barWidth, h, 0, 0, 4, 4);   // smussati sotto
    }
  }

  // Linea della media
  let meanY = -map(mean0, minVal, maxVal, -graphHeight, graphHeight);
  stroke(0);
  strokeWeight(2);
  line(0, meanY, values.length * totalBarSpace, meanY);

  // Etichetta della media
  noStroke();
  fill(0);
  textAlign(LEFT, CENTER);
  textStyle(BOLD);
  text("MEAN OF COLUMN 0:  " + mean0.toFixed(2), values.length * totalBarSpace + 10, meanY);

  pop();

  // Tooltip visibile solo se il cursore è sopra una barra
  if (hoveredBarIndex !== null && hoveredBarIndex >= 0 && hoveredBarIndex < values.length) {
    let val = values[hoveredBarIndex];
    let label = "Valore: " + val.toFixed(2);
    textSize(14);
    let padding = 6;
    let w = textWidth(label) + padding * 2;
    let h = 24;

    fill(255, 245, 255, 230);
    stroke(150);
    rect(mouseX + 10, mouseY - h - 10, w, h, 4);

    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    text(label, mouseX + 10 + padding, mouseY - h / 2 - 10);
  }
}

function mouseMoved() {
  let graphX = 60;
  let graphY = 635;
  let barWidth = 7;
  let barSpacing = 1;
  let totalBarSpace = barWidth + barSpacing;
  let graphHeight = 200;

  let x = mouseX - graphX;
  let y = mouseY - graphY;

  hoveredBarIndex = null;

  if (x >= 0 && y >= -graphHeight && y <= graphHeight) {
    let index = Math.floor(x / totalBarSpace);
    if (index >= 0 && index < validRows.length) {
      let val = validRows[index].getNum(0);
      let h = map(Math.abs(val), 0, Math.max(...validRows.map(r => Math.abs(r.getNum(0)))), 0, graphHeight);
      let barX = graphX + index * totalBarSpace;
      let barY = val >= 0 ? graphY - h : graphY;
      let barBottom = val >= 0 ? graphY : graphY + h;

      if (
        mouseX >= barX &&
        mouseX <= barX + barWidth &&
        mouseY >= barY &&
        mouseY <= barBottom
      ) {
        hoveredBarIndex = index;
      }
    }
  }
}

function drawText2() {
  // Calcola la deviazione standard della colonna 1
  let stdDev1 = StandardDeviation(1);

  // Posizione del testo
  let x = 30;
  let y = 880;

  // Sfondo semplice con colore coerente
  push();
  fill(230, 220, 240); // viola chiarissimo
  noStroke();
  rect(x, y - 20, 305, 40); // rettangolo semplice
  pop();

  // Testo descrittivo
  push();
  textAlign(LEFT, CENTER);
  textSize(16);
  fill(90, 30, 150); // viola scuro
  text("Standard deviation of column 1:", x + 10, y);

  textSize(18);
  fill(176, 96, 224); // viola medio
  text(stdDev1.toFixed(2), x + 250, y);
  pop();
}

function drawText3() {
  // Calcola i valori statistici
  let stdDev1 = StandardDeviation(1);
  let mode2 = Mode(2);

  // Posizione iniziale
  let x = 30;
  let y = 880;

  // Casella 1: Deviazione standard colonna 1
  push();
  fill(230, 220, 240); // viola chiarissimo
  noStroke();
  rect(x, y - 20, 305, 40); // rettangolo semplice
  pop();

  push();
  textAlign(LEFT, CENTER);
  textSize(16);
  fill(90, 30, 150); // viola scuro
  text("Standard deviation of column 1:", x + 10, y);

  textSize(18);
  fill(176, 96, 224); // viola medio
  text(stdDev1.toFixed(2), x + 250, y);
  pop();

  // Casella 2: Moda colonna 2 (affiancata)
  let x2 = x + 325; // distanza tra le due caselle

  push();
  fill(230, 220, 240); // stesso sfondo
  noStroke();
  rect(x2, y - 20, 220, 40);
  pop();

  push();
  textAlign(LEFT, CENTER);
  textSize(16);
  fill(90, 30, 150); // viola scuro
  text("Mode of column 2:", x2 + 10, y);

  textSize(18);
  fill(176, 96, 224); // viola medio
  text(mode2, x2 + 160, y);
  pop();
}

function drawGraph2() {
  let values = validRows.map(row => row.getNum(3));
  let median3 = Median(3);
  let maxVal = Math.max(...values);
  let minVal = Math.min(...values);

  // Parametri grafico
  let startX = 30;
  let centerY = 970;
  let spacing = 18;
  let minSize = 8;
  let maxSize = 24;

  let sorted = [...values].sort((a, b) => a - b);

  push();
  textAlign(CENTER, CENTER);
  textSize(12);
  noStroke();

  for (let i = 0; i < sorted.length; i++) {
    let val = sorted[i];
    let x = startX + i * spacing;
    let size = map(val, minVal, maxVal, minSize, maxSize);

    let t = map(val, minVal, maxVal, 0, 1);
    let r = lerp(230, 90, t);
    let g = lerp(220, 30, t);
    let b = lerp(240, 150, t);
    fill(r, g, b);

    if (val === median3) {
      fill(90, 30, 150);
      ellipse(x, centerY, size + 6, size + 6);
      fill(0);
      textStyle(BOLD);
      text("MEDIAN OF COLUMN 3: " + median3.toFixed(2), x, centerY - size + 40);
    } else {
      ellipse(x, centerY, size, size);
    }
  }

  pop();

  // Tooltip
  if (hoveredCircleIndex !== null && hoveredCircleIndex >= 0 && hoveredCircleIndex < sorted.length) {
    let val = sorted[hoveredCircleIndex];
    let x = startX + hoveredCircleIndex * spacing;
    let size = map(val, minVal, maxVal, minSize, maxSize);

    let label = "Valore: " + val.toFixed(2);
    textSize(14);
    let padding = 6;
    let w = textWidth(label) + padding * 2;
    let h = 24;

    fill(255, 245, 255, 230);
    stroke(150);
    rect(mouseX + 10, mouseY - h - 10, w, h, 4);

    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    text(label, mouseX + 10 + padding, mouseY - h / 2 - 10);
  }
}

function mouseMoved() {
  let values = validRows.map(row => row.getNum(3));
  let maxVal = Math.max(...values);
  let minVal = Math.min(...values);

  let startX = 30;
  let centerY = 970;
  let spacing = 18;
  let minSize = 8;
  let maxSize = 24;

  let sorted = [...values].sort((a, b) => a - b);
  hoveredCircleIndex = null;

  for (let i = sorted.length - 1; i >= 0; i--) {
    let val = sorted[i];
    let x = startX + i * spacing;
    let size = map(val, minVal, maxVal, minSize, maxSize);
    let d = dist(mouseX, mouseY, x, centerY);

    if (d <= size / 2 + 4) {
      hoveredCircleIndex = i;
      break;
    }
  }
}

function drawText4() {
  let mean4 = Mean(4);
  let x = 30;
  let y = 1075;

  // Sfondo
  push();
  fill(230, 220, 240); // viola chiarissimo
  noStroke();
  rect(x, y - 20, 305, 40);
  pop();

  // Testo
  push();
  textAlign(LEFT, CENTER);
  textSize(16);
  fill(90, 30, 150); // viola scuro
  text("Mean of column 4:", x + 10, y);

  textSize(18);
  fill(176, 96, 224); // viola medio
  text(mean4.toFixed(2), x + 250, y);
  pop();
}

function drawText5() {
  let stdDev4 = StandardDeviation(4);
  let x = 360;
  let y = 1075;

  // Sfondo
  push();
  fill(230, 220, 240); // viola chiarissimo
  noStroke();
  rect(x, y - 20, 305, 40);
  pop();

  // Testo
  push();
  textAlign(LEFT, CENTER);
  textSize(16);
  fill(90, 30, 150); // viola scuro
  text("Standard deviation of column 4:", x + 10, y);

  textSize(18);
  fill(176, 96, 224); // viola medio
  text(stdDev4.toFixed(2), x + 250, y);
  pop();
}


