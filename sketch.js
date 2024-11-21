let particles = [];
let density = 200;        
let particleSize = 14;    
let explosionForce = 2;   
let gravity = 0.1;        
let friction = 0.98;      
let hueStart = 0;         
let hueRange = 60;        
let fadeSpeed = 0.03;     
let autoExplode = false;  
let explosionRadius = 2;  
let particleChars = ["0", "1"];  

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1);
  textSize(particleSize);
  textAlign(CENTER, CENTER);
  background(0);
  
  createExplosion(width/2, height/2);
  createControls();
}

function draw() {
  background(0, 0, 0, fadeSpeed);
  
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    
    p.x += p.vx;
    p.y += p.vy;
    p.vy += gravity;
    p.vx *= friction;
    p.vy *= friction;
    
    let distance = dist(p.startX, p.startY, p.x, p.y);
    let hue = (hueStart + (distance * 0.1) % hueRange) % 360;
    let alpha = map(p.life, 0, p.maxLife, 1, 0);
    
    fill(hue, 100, 100, alpha);
    text(p.char, p.x, p.y);
    
    p.life--;
    
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
  
  if (autoExplode && particles.length === 0) {
    createExplosion(random(width), random(height));
  }
}

function createExplosion(x, y) {
  for (let i = 0; i < density; i++) {
    let angle = random(TWO_PI);
    let speed = random(2, explosionForce * 10);
    let particle = {
      x: x,
      y: y,
      startX: x,
      startY: y,
      vx: cos(angle) * speed * explosionRadius,
      vy: sin(angle) * speed * explosionRadius,
      char: random(particleChars),
      life: random(50, 150),
      maxLife: 150
    };
    particles.push(particle);
  }
}

function mousePressed() {
  createExplosion(mouseX, mouseY);
}

function createControls() {
  let rightPanelX = width - 250;
  let startY = 10;
  let spacing = 60;
  
  createP('爆炸效果设置')
    .position(rightPanelX, startY)
    .style('color', 'white')
    .style('margin', '0');
  
  createSliderControl('粒子数量', 50, 500, density, 10, 
    rightPanelX, startY + spacing, (value) => {
    density = value;
  });
  
  createSliderControl('粒子大小', 8, 24, particleSize, 2, 
    rightPanelX, startY + spacing * 2, (value) => {
    particleSize = value;
    textSize(particleSize);
  });
  
  createSliderControl('爆炸力度', 1, 5, explosionForce, 0.1, 
    rightPanelX, startY + spacing * 3, (value) => {
    explosionForce = value;
  });
  
  createSliderControl('爆炸半径', 1, 5, explosionRadius, 0.1, 
    rightPanelX, startY + spacing * 4, (value) => {
    explosionRadius = value;
  });
  
  createSliderControl('重力', 0, 0.3, gravity, 0.01, 
    rightPanelX, startY + spacing * 5, (value) => {
    gravity = value;
  });
  
  createSliderControl('拖尾效果', 0.01, 0.1, fadeSpeed, 0.01, 
    rightPanelX, startY + spacing * 6, (value) => {
    fadeSpeed = value;
  });
  
  createSliderControl('色相起始值', 0, 360, hueStart, 5, 
    rightPanelX, startY + spacing * 7, (value) => {
    hueStart = value;
  });
  
  createSliderControl('色相范围', 10, 360, hueRange, 5, 
    rightPanelX, startY + spacing * 8, (value) => {
    hueRange = value;
  });

  // 粒子内容控制
  let leftPanelX = 10;
  let inputY = height - 120;

  let inputLabel = createP('粒子内容 (用逗号分隔)');
  inputLabel.position(leftPanelX, inputY);
  inputLabel.style('color', 'white');
  inputLabel.style('margin', '0');

  let particleInput = createInput(particleChars.join(','));
  particleInput.position(leftPanelX, inputY + 30);
  styleInput(particleInput);
  
  let updateButton = createButton('更新粒子');
  updateButton.position(leftPanelX + 160, inputY + 30);
  updateButton.mousePressed(() => {
    let newChars = particleInput.value().split(',').map(char => char.trim());
    if (newChars.length === 0 || (newChars.length === 1 && newChars[0] === '')) {
      newChars = ["0", "1"];
      particleInput.value("0,1");
    }
    particleChars = newChars;
  });

  // 预设按钮
  let presets = {
    '数字': '0,1',
    '符号': '★,♥,♦,♠,♣',
    '表情': '😀,😎,🎉,✨,💫',
    '字母': 'A,B,C,D,E',
    '点线': '•,|,-,+,×'
  };

  let presetY = inputY + 70;
  Object.entries(presets).forEach(([name, chars], index) => {
    let presetBtn = createButton(name);
    presetBtn.position(leftPanelX + index * 60, presetY);
    presetBtn.mousePressed(() => {
      particleInput.value(chars);
      particleChars = chars.split(',');
    });
    styleButton(presetBtn);
  });

  // 自动爆炸开关
  let autoButton = createButton('自动爆炸: OFF');
  autoButton.position(rightPanelX, startY + spacing * 9);
  autoButton.mousePressed(() => {
    autoExplode = !autoExplode;
    autoButton.html('自动爆炸: ' + (autoExplode ? 'ON' : 'OFF'));
  });
  styleButton(autoButton);
}

function createSliderControl(label, min, max, value, step, x, y, callback) {
  createP(label)
    .position(x, y)
    .style('color', 'white')
    .style('margin', '0');
  
  let slider = createSlider(min, max, value, step);
  slider.position(x, y + 25);
  slider.style('width', '200px');
  slider.input(() => callback(slider.value()));
  return slider;
}

function styleInput(input) {
  input.style('width', '150px');
  input.style('background-color', '#333');
  input.style('color', 'white');
  input.style('border', '1px solid #666');
  input.style('padding', '5px');
}

function styleButton(button) {
  button.style('background-color', '#444');
  button.style('color', 'white');
  button.style('border', '1px solid #666');
  button.style('padding', '5px 10px');
  button.style('cursor', 'pointer');
  button.style('margin', '2px');
  button.mouseOver(() => button.style('background-color', '#555'));
  button.mouseOut(() => button.style('background-color', '#444'));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  removeElements();
  createControls();
}