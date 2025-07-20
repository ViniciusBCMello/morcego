class BatEcholocationSimulator {
    constructor() {
        this.isGameMode = false;
        this.isScientificMode = false;
        this.isNightVision = false;
        this.score = 0;
        this.insectsFound = 0;
        this.totalInsects = 3 + this.difficulty * 2;
        this.level = 1;
        this.difficulty = 1;
        this.insects = [];
        this.obstacles = [];
        this.lastEchoTime = 0;
        this.energy = 100;
        this.maxEnergy = 100;
        this.sonarCooldown = 0;
        this.sonarRange = 120;
        this.gameActive = false;
        this.nightVisionInterval = null;
        this.batPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.batMovingInterval = null;
        this.autoSonarInterval = null;
        this.worldInsects = [];
        this.worldObstacles = [];

        // Facts about bats
        this.batFacts = [
        [
            "🦇 Existem mais de 1.400 espécies de morcegos - cerca de 20% de todos os mamíferos!",
            "🌎 O único mamífero capaz de voar verdadeiramente (não apenas planar)",
            "🕊 Alguns morcegos podem atingir velocidades de voo de até 160 km/h",
            "🏆 O menor morcego (Kitti) pesa apenas 2g - menor que uma moeda!",
            "🏋️ O maior (raposa voadora) tem 1,7m de envergadura!",
            "🧼 Morcegos se limpam cuidadosamente, como gatos"
        ],
        [
            "🕵️ Podem identificar texturas diferentes através do eco (folha lisa vs. áspera)",
            "🌀 Algumas espécies usam 'assinaturas sonoras' únicas para se reconhecer",
            "🏡 Morcegos urbanos adaptaram seus sons para evitar interferências de ruídos",
            "🎶 Cantam como pássaros - alguns com dialetos regionais!",
            "🧭 Usam o campo magnético da Terra para navegação em longas distâncias",
            "🧠 Memorizam rotas complexas com marcos acústicos"
        ],
        [
            "🌺 Polinizam mais de 500 espécies de plantas, incluindo o agave da tequila!",
            "🌱 Um morcego pode dispersar 60.000 sementes em uma noite",
            "☕ Sem morcegos, não haveria café nem chocolate selvagem",
            "🦟 Comem até 1.200 insetos por hora - ótimos controladores de pragas",
            "🩸 Apenas 3 espécies se alimentam de sangue (todas nas Américas)",
            "🐟 O morcego-pescador usa garras para capturar peixes!"
        ],
        [
            "❤️ Batem o coração até 1.000x por minuto durante o voo",
            "🧊 Algumas espécies sobrevivem a -40°C congeladas e 'ressuscitam'",
            "🥇 Vivem até 40 anos - recorde entre mamíferos do mesmo tamanho",
            "👶 Mães reconhecem filhotes pelo cheiro e chamados únicos",
            "🤫 Podem reduzir seu metabolismo em 98% para economizar energia",
            "🧬 Possuem imunidade extraordinária a vírus (como Ebola)"
        ],
        [
            "🎨 Pinturas rupestres de 30.000 anos já retratavam morcegos",
            "📜 Na China, são símbolo de boa sorte e prosperidade",
            "🦇 O Batman foi inspirado em Leonardo da Vinci (que estudou morcegos)",
            "🏛 Maias construíam templos com formatos de nariz de morcego",
            "⚡ Seus superpoderes inspiraram tecnologias de sonar e radar",
            "🚀 NASA estudou morcegos para melhorar drones de asas flexíveis"
        ]
    ];

    this.currentFactGroup = 0;
    this.factRotationInterval = null;
        
        this.init();
        this.loadHighScore();
    }

    init() {
        this.setupEventListeners();
        this.setupWaveCanvas();
        this.setupBatDrag();
        this.generateEnvironment();
        this.startBatMovement();
        this.startAutoSonar();
    }

    setupEventListeners() {
        document.getElementById('sonarBtn').addEventListener('click', () => {this.emitSonar();
        if (!this.isGameMode) {
            this.restartAutoSonar();
        }
        });
        document.getElementById('batImage').addEventListener('click', () => this.toggleFacts());
        document.getElementById('gameBtn').addEventListener('click', () => this.toggleGameMode());
        document.getElementById('scientificBtn').addEventListener('click', () => this.toggleScientificMode());
        document.getElementById('nightBtn').addEventListener('click', () => this.toggleNightVision());
        document.getElementById('closeFacts').addEventListener('click', () => this.toggleFacts());
        document.getElementById('closeScientific').addEventListener('click', () => this.toggleScientificMode());
        document.getElementById('exitNightBtn').addEventListener('click', () => this.toggleNightVision());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetEnvironment());

        // Difficulty selector
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = parseInt(e.target.dataset.level);
                this.generateEnvironment();
            });
        });
    }

    setupBatDrag() {
        const batImage = document.getElementById('batImage');
        let isDragging = false;
        let offsetX, offsetY;

        batImage.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - batImage.getBoundingClientRect().left;
            offsetY = e.clientY - batImage.getBoundingClientRect().top;
            batImage.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            batImage.style.left = x + 'px';
            batImage.style.top = y + 'px';
            this.batPosition = { x, y };
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            batImage.style.cursor = 'pointer';
        });

        // Touch support
        batImage.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            offsetX = touch.clientX - batImage.getBoundingClientRect().left;
            offsetY = touch.clientY - batImage.getBoundingClientRect().top;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const x = touch.clientX - offsetX;
            const y = touch.clientY - offsetY;
            
            batImage.style.left = x + 'px';
            batImage.style.top = y + 'px';
            this.batPosition = { x, y };
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    setupWaveCanvas() {
        this.canvas = document.getElementById('waveCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 280;
        this.canvas.height = 60;
    }

    startBatMovement() {
        if (this.batMovingInterval) clearInterval(this.batMovingInterval);

        const batImage = document.getElementById('batImage');

        // Define direção inicial
        let angle = Math.random() * 2 * Math.PI;
        let speed = 2 + Math.random() * 2;
        let dx = Math.cos(angle) * speed;
        let dy = Math.sin(angle) * speed;

        this.batMovingInterval = setInterval(() => {
            const currentX = parseFloat(batImage.style.left) || this.batPosition.x;
            const currentY = parseFloat(batImage.style.top) || this.batPosition.y;

            let newX = currentX + dx;
            let newY = currentY + dy;

            // Rebater nas bordas
            const batSize = 80;
            if (newX < 0 || newX > window.innerWidth - batSize) {
                dx = -dx;
                newX = Math.max(0, Math.min(newX, window.innerWidth - batSize));
            }
            if (newY < 0 || newY > window.innerHeight - batSize) {
                dy = -dy;
                newY = Math.max(0, Math.min(newY, window.innerHeight - batSize));
            }

            // Atualiza posição
            batImage.style.left = `${newX}px`;
            batImage.style.top = `${newY}px`;
            this.batPosition = { x: newX, y: newY };

            // Pequena chance de mudar direção
            if (Math.random() < 0.02) {
                angle = Math.random() * 2 * Math.PI;
                dx = Math.cos(angle) * speed;
                dy = Math.sin(angle) * speed;
            }

        }, 50);
    }   

    startAutoSonar() {
        this.restartAutoSonar();
    }

    emitWorldSonar() {
        // Cria o elemento da onda sonar
        const sonarWave = document.createElement('div');
        sonarWave.className = 'bat-sonar-wave';

        // Adiciona à tela
        document.body.appendChild(sonarWave);

        // Tempo de animação
        const startTime = performance.now();
        const duration = 1500;

        const animateWave = (now) => {
            const elapsed = now - startTime;
            const progress = elapsed / duration;

            // Pega posição real do centro do morcego (compensando qualquer transformação)
            const batImage = document.getElementById('batImage');
            const rect = batImage.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Posiciona o sonar no centro do morcego
            sonarWave.style.left = `${centerX}px`;
            sonarWave.style.top = `${centerY}px`;
            sonarWave.style.transform = 'translate(-50%, -50%) scale(0.5)';
            sonarWave.style.width = '20px';
            sonarWave.style.height = '20px';
            sonarWave.style.marginLeft = '-10px';
            sonarWave.style.marginTop = '-10px';

            if (progress < 1) {
                requestAnimationFrame(animateWave);
            } else {
                if (sonarWave.parentNode) {
                    document.body.removeChild(sonarWave);
                }
            }
        };

        requestAnimationFrame(animateWave);

        // Detecta objetos no mundo
        const objectsDetected = this.detectWorldObjects();

        // Atualiza painel científico
        if (this.isScientificMode) {
            this.lastEchoTime = 100 + Math.random() * 300; // tempo de eco simulado
            this.updateScientificData();
            this.drawWaveform();

            document.getElementById('objectsDetected').textContent = objectsDetected;
        }

        // Toca som
        this.playPingSound();
    }

    detectWorldObjects() {
        const sonarRange = 200; // pixels
        let objectsDetected = 0;
        
        // Show insects
        this.worldInsects.forEach(insect => {
            const distance = Math.sqrt(
                Math.pow(insect.x - (this.batPosition.x + 40), 2) + 
                Math.pow(insect.y - (this.batPosition.y + 40), 2)
            );
            
            if (distance <= sonarRange) {
                insect.element.style.display = 'block';
                objectsDetected++;
                
                setTimeout(() => {
                    insect.element.style.display = 'none';
                }, 2000);
            }
        });
        
        // Show obstacles
        this.worldObstacles.forEach(obstacle => {
            const distance = Math.sqrt(
                Math.pow(obstacle.x - (this.batPosition.x + 40), 2) + 
                Math.pow(obstacle.y - (this.batPosition.y + 40), 2)
            );
            
            if (distance <= sonarRange) {
                obstacle.element.style.display = 'block';
                objectsDetected++;
                
                setTimeout(() => {
                    obstacle.element.style.display = 'none';
                }, 2000);
            }
        });
        
        return objectsDetected;
    }

    startFactRotation() {
    // Limpa o intervalo existente
    if (this.factRotationInterval) {
        clearInterval(this.factRotationInterval);
    }
    
    // Exibe o primeiro grupo imediatamente
    this.showCurrentFactGroup();
    
    // Configura a rotação a cada 1 minuto (60000ms)
    this.factRotationInterval = setInterval(() => {
        this.currentFactGroup = (this.currentFactGroup + 1) % this.batFacts.length;
        this.showCurrentFactGroup();
    }, 60000);
    }

    showCurrentFactGroup() {
        const factsList = document.querySelector('#factsPanel ul');
        factsList.innerHTML = '';

        this.batFacts[this.currentFactGroup].forEach(fact => {
            const li = document.createElement('li');
            li.innerHTML = fact;
            li.style.margin = '10px 0';
            li.style.padding = '8px';
            li.style.background = 'rgba(30, 144, 255, 0.1)';
            li.style.borderRadius = '5px';
            li.style.borderLeft = '3px solid #00bfff';
            factsList.appendChild(li);
        });

        document.getElementById('factGroupIndicator').textContent = `${this.currentFactGroup + 1}/${this.batFacts.length}`;
    }


    toggleFacts() {
        const panel = document.getElementById('factsPanel');
        panel.classList.toggle('show');

        if (panel.classList.contains('show')){
            this.startFactRotation();
        }
        else {
            if (this.factRotationInterval) {
                clearInterval(this.factRotationInterval);
                this.factRotationInterval = null;
            }
        }
    }

    toggleScientificMode() {
        this.isScientificMode = !this.isScientificMode;
        const panel = document.getElementById('scientificPanel');
        const waveVisual = document.getElementById('waveVisual');
        
        if (this.isScientificMode) {
            panel.classList.add('show');
            waveVisual.classList.add('show');
            // Emit sonar immediately when entering scientific mode
            this.emitWorldSonar();
        } else {
            panel.classList.remove('show');
            waveVisual.classList.remove('show');
        }
    }

    toggleGameMode() {
        this.isGameMode = !this.isGameMode;
        const gameStats = document.getElementById('gameStats');
        const difficultySelector = document.getElementById('difficultySelector');
        const radarWrapper = document.getElementById('radarWrapper');
        
        if (this.isGameMode) {
            gameStats.style.display = 'flex';
            difficultySelector.style.display = 'block';
            radarWrapper.style.display = 'block';
            this.score = 0;
            this.totalInsects = 3 + this.difficulty * 2;
            this.insectsFound = 0;
            this.level = 1;
            this.energy = 100;
            this.gameActive = false;
            this.updateGameStats();
            this.saveHighScore();
            this.startGameCountdown();
        } else {
            gameStats.style.display = 'none';
            difficultySelector.style.display = 'none';
            radarWrapper.style.display = 'none';
            this.gameActive = false;
            clearInterval(this.nightVisionInterval);
        }
        
        this.generateEnvironment();
    }

    startGameCountdown() {
        const countdown = document.createElement('div');
        countdown.className = 'countdown-modal';
        countdown.innerHTML = `
            <div class="countdown-content">
                <h2>Prepare-se!</h2>
                <div class="countdown-number" id="countdownNumber">3</div>
                <p>Use o sonar para encontrar insetos</p>
            </div>
        `;
        document.body.appendChild(countdown);
        
        let count = 3;
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                document.getElementById('countdownNumber').textContent = count;
            } else {
                document.getElementById('countdownNumber').textContent = 'GO!';
                setTimeout(() => {
                    document.body.removeChild(countdown);
                    this.gameActive = true;
                    this.startEnergyRegeneration();
                }, 500);
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    startCooldown() {
        const radarArea = document.getElementById('radarArea');
        const cooldownTime = 2000;
        this.sonarCooldown = cooldownTime;
        
        const cooldownOverlay = document.createElement('div');
        cooldownOverlay.className = 'cooldown-overlay';
        cooldownOverlay.id = 'cooldownOverlay';
        radarArea.appendChild(cooldownOverlay);
        
        document.getElementById('sonarBtn').disabled = true;
        
        const countdownInterval = setInterval(() => {
            this.sonarCooldown -= 100;
            const secondsLeft = Math.ceil(this.sonarCooldown / 1000);
            cooldownOverlay.textContent = secondsLeft;
            
            if (this.sonarCooldown <= 0) {
                clearInterval(countdownInterval);
                if (radarArea.contains(cooldownOverlay)) {
                    radarArea.removeChild(cooldownOverlay);
                }
                document.getElementById('sonarBtn').disabled = false;
            }
        }, 100);
    }

    startEnergyRegeneration() {
        setInterval(() => {
            if (this.isGameMode && this.gameActive && this.energy < this.maxEnergy) {
                this.energy = Math.min(this.maxEnergy, this.energy + 2);
                this.updateEnergyBar();
            }
        }, 500);
    }

    updateEnergyBar() {
        const energyFill = document.getElementById('energyFill');
        const energyText = document.getElementById('energy');
        
        if (energyFill && energyText) {
            energyFill.style.width = this.energy + '%';
            energyText.textContent = Math.round(this.energy);
        }
    }

    toggleNightVision() {
        this.isNightVision = !this.isNightVision;
        const app = document.getElementById('app');
        const nightControls = document.getElementById('nightVisionControls');
        
        if (this.isNightVision) {
            app.classList.add('night-vision');
            nightControls.style.display = 'block';
            this.startNightVisionScan();
        } else {
            app.classList.remove('night-vision');
            nightControls.style.display = 'none';
            clearInterval(this.nightVisionInterval);
        }
    }

    startNightVisionScan() {
        clearInterval(this.nightVisionInterval);
        this.nightVisionInterval = setInterval(() => {
            if (this.isNightVision) {
                this.emitSonar(true);
            }
        }, 1000);
    }

    resetEnvironment() {
        const batImage = document.getElementById('batImage');
        batImage.style.left = '50%';
        batImage.style.top = '50%';
        batImage.style.transform = 'translate(-50%, -50%)';
        this.batPosition = { 
            x: window.innerWidth / 2, 
            y: window.innerHeight / 2 
        };
        this.generateEnvironment();
    }

    generateEnvironment() {
        // Clear existing elements
        const radarArea = document.getElementById('radarArea');
        radarArea.innerHTML = '';
        
        // Clear world objects
        this.worldInsects.forEach(insect => {
            if (insect.element.parentNode) {
                document.body.removeChild(insect.element);
            }
        });
        this.worldObstacles.forEach(obstacle => {
            if (obstacle.element.parentNode) {
                document.body.removeChild(obstacle.element);
            }
        });
        
        this.insects = [];
        this.obstacles = [];
        this.worldInsects = [];
        this.worldObstacles = [];
        
        if (this.isGameMode) {
            const sonarRange = document.createElement('div');
            sonarRange.className = 'sonar-range';
            sonarRange.style.width = (this.sonarRange * 2) + 'px';
            sonarRange.style.height = (this.sonarRange * 2) + 'px';
            sonarRange.style.display = 'block';
            radarArea.appendChild(sonarRange);
            
            // Generate insects for radar
            for (let i = 0; i < this.totalInsects; i++) {
                this.createInsect();
            }
            
            // Generate obstacles for radar
            const obstacleCount = 2 + this.difficulty;
            for (let i = 0; i < obstacleCount; i++) {
                this.createObstacle();
            }
            
            document.getElementById('totalInsects').textContent = this.totalInsects;
        } else {
            // Generate world insects (not in game mode)
            const insectCount = 10;
            const insectTypes = ['🦟', '🪰', '🪲', '🐛'];
            
            for (let i = 0; i < insectCount; i++) {
                const insect = document.createElement('div');
                insect.className = 'world-object world-insect';
                insect.textContent = insectTypes[Math.floor(Math.random() * insectTypes.length)];
                
                const x = Math.random() * (window.innerWidth - 40);
                const y = Math.random() * (window.innerHeight - 40);
                
                insect.style.left = x + 'px';
                insect.style.top = y + 'px';
                
                const insectData = {
                    element: insect,
                    x: x + 12,
                    y: y + 12,
                    type: insectTypes[Math.floor(Math.random() * insectTypes.length)]
                };
                
                this.worldInsects.push(insectData);
                document.body.appendChild(insect);
                
                // Make insects move
                if (Math.random() > 0.3) { // 70% chance to move
                    this.startInsectMovement(insectData);
                }
            }
            
            // Generate world obstacles (not in game mode)
            const obstacleCount = 5;
            for (let i = 0; i < obstacleCount; i++) {
                const obstacle = document.createElement('div');
                obstacle.className = 'world-object world-obstacle';
                
                const width = 30 + Math.random() * 70;
                const height = 30 + Math.random() * 70;
                const x = Math.random() * (window.innerWidth - width);
                const y = Math.random() * (window.innerHeight - height);
                
                obstacle.style.width = width + 'px';
                obstacle.style.height = height + 'px';
                obstacle.style.left = x + 'px';
                obstacle.style.top = y + 'px';
                
                const obstacleData = {
                    element: obstacle,
                    x: x + width/2,
                    y: y + height/2,
                    width,
                    height
                };
                
                this.worldObstacles.push(obstacleData);
                document.body.appendChild(obstacle);
            }
        }
    }

    startInsectMovement(insect) {
        let dx = (Math.random() - 0.5) * 2;
        let dy = (Math.random() - 0.5) * 2;
        const speed = 1 + Math.random() * 2;
        
        const moveInterval = setInterval(() => {
            let x = parseInt(insect.element.style.left) || 0;
            let y = parseInt(insect.element.style.top) || 0;
            
            // Bounce off edges
            if (x <= 0 || x >= window.innerWidth - 24) dx = -dx;
            if (y <= 0 || y >= window.innerHeight - 24) dy = -dy;
            
            x += dx * speed;
            y += dy * speed;
            
            insect.element.style.left = x + 'px';
            insect.element.style.top = y + 'px';
            insect.x = x + 12;
            insect.y = y + 12;
        }, 50);
        
        // Random direction changes
        setInterval(() => {
            if (Math.random() > 0.8) { // 20% chance to change direction
                dx = (Math.random() - 0.5) * 2;
                dy = (Math.random() - 0.5) * 2;
            }
        }, 1000);
    }

    createInsect() {
        const insect = document.createElement('div');
        insect.className = 'insect';
        
        const insectTypes = ['mosquito', 'beetle', 'fly'];
        const type = insectTypes[Math.floor(Math.random() * insectTypes.length)];
        insect.classList.add(type);
        insect.textContent = type === 'mosquito' ? '🦟' : type === 'beetle' ? '🪲' : '🪰';
        
        const angle = Math.random() * 2 * Math.PI;
        const radius = 30 + Math.random() * (this.sonarRange - 30);
        const x = 150 + Math.cos(angle) * radius;
        const y = 150 + Math.sin(angle) * radius;
        
        insect.style.left = x + 'px';
        insect.style.top = y + 'px';
        
        const insectData = { 
            element: insect, 
            x, 
            y, 
            found: false,
            visible: false,
            type
        };
        this.insects.push(insectData);
        
        insect.addEventListener('click', () => {
            if (this.isGameMode && this.gameActive && insectData.visible && !insectData.found) {
                insectData.found = true;
                insect.classList.add('caught');
                this.score += 10 * this.difficulty;
                this.insectsFound++;
                this.updateGameStats();
                this.saveHighScore();
                
                // Check if all insects are found
                if (this.insectsFound >= this.totalInsects) {
                    this.levelUp();
                }
            }
        });
        
        document.getElementById('radarArea').appendChild(insect);
    }

    createObstacle() {
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        const width = 20 + Math.random() * 30;
        const height = 20 + Math.random() * 30;
        const angle = Math.random() * 2 * Math.PI;
        const radius = 40 + Math.random() * (this.sonarRange - 40);
        const x = 150 + Math.cos(angle) * radius;
        const y = 150 + Math.sin(angle) * radius;
        
        obstacle.style.width = width + 'px';
        obstacle.style.height = height + 'px';
        obstacle.style.left = x + 'px';
        obstacle.style.top = y + 'px';
        
        const obstacleData = {                                                                                                        
            element: obstacle, 
            x, 
            y, 
            width, 
            height,
            visible: false
        };
        this.obstacles.push(obstacleData);
        
        document.getElementById('radarArea').appendChild(obstacle);
    }

    restartAutoSonar() {
        if (this.autoSonarInterval) {
            clearInterval(this.autoSonarInterval);
        }
        this.emitWorldSonar(); // Emite imediatamente
        this.autoSonarInterval = setInterval(() => {
            if (!this.isGameMode || this.isScientificMode) {
                this.emitWorldSonar();
            }
        }, 5000); // Reinicia o intervalo de 5 segundos
    }

    emitSonar(nightVisionMode = false) {
        if (this.isGameMode && !nightVisionMode) {
            if (this.sonarCooldown > 0 || this.energy < 20 || !this.gameActive) {
                return;
            }
            else{
                this.restartAutoSonar();
            }
            this.energy = Math.max(0, this.energy - 20);
            this.updateEnergyBar();
        }
        
        const radarArea = document.getElementById('radarArea');
        const delay = 200 + Math.random() * 400;
        this.lastEchoTime = delay;
        
        // Create sonar wave
        const sonarWave = document.createElement('div');
        sonarWave.className = 'sound-wave';
        radarArea.appendChild(sonarWave);
        
        // Start animation
        setTimeout(() => {
            sonarWave.style.transition = 'all 1s ease-in-out';
            sonarWave.style.transform = 'scale(10)';
            
            setTimeout(() => {
                sonarWave.style.transform = 'scale(0)';
                
                setTimeout(() => {
                    if (radarArea.contains(sonarWave)) {
                        radarArea.removeChild(sonarWave);
                    }
                }, 1000);
            }, 1000);
        }, 10);
        
        // Detect objects
        this.detectObjects(nightVisionMode);
        
        // Play sound effect
        this.playPingSound();
        
        // Update scientific data
        if (this.isScientificMode) {
            this.updateScientificData();
            this.drawWaveform();
        }
    }

    detectObjects(nightVisionMode = false) {
        let objectsDetected = 0;
        const centerX = 150;
        const centerY = 150;
        
        // Show insects
        this.insects.forEach(insect => {
            const distance = Math.sqrt(
                Math.pow(insect.x - centerX, 2) + 
                Math.pow(insect.y - centerY, 2)
            );
            
            if (distance <= this.sonarRange || nightVisionMode) {
                if (!insect.found) {
                    insect.visible = true;
                    insect.element.style.display = 'block';
                    
                    if (!nightVisionMode) {
                        setTimeout(() => {
                            insect.visible = false;
                            insect.element.style.display = 'none';
                        }, 1000);
                    }
                    
                    objectsDetected++;
                }
            } else {
                insect.visible = false;
                insect.element.style.display = 'none';
            }
        });
        
        // Show obstacles
        this.obstacles.forEach(obstacle => {
            const distance = Math.sqrt(
                Math.pow(obstacle.x - centerX, 2) + 
                Math.pow(obstacle.y - centerY, 2)
            );
            
            if (distance <= this.sonarRange || nightVisionMode) {
                obstacle.visible = true;
                obstacle.element.style.display = 'block';
                
                if (!nightVisionMode) {
                    setTimeout(() => {
                        obstacle.visible = false;
                        obstacle.element.style.display = 'none';
                    }, 1000);
                }
                
                objectsDetected++;
            } else {
                obstacle.visible = false;
                obstacle.element.style.display = 'none';
            }
        });
        
        // Update scientific panel
        if (this.isScientificMode) {
            document.getElementById('objectsDetected').textContent = objectsDetected;
        }
    }

    levelUp() {
        this.level++;
        this.sonarRange = Math.max(80, this.sonarRange - 10);

        // Increase insects
        this.totalInsects += 2 + this.difficulty;
        this.insectsFound = 0; 

        this.generateEnvironment();
        this.updateGameStats();
        
        // Show level up message
        const message = document.createElement('div');
        message.className = 'countdown-modal';
        message.innerHTML = `
            <div class="countdown-content">
                <h2>Nível ${this.level}!</h2>
                <p>Alcance do sonar reduzido</p>
            </div>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            document.body.removeChild(message);
        }, 1500);
    }

    updateGameStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('insects').textContent = this.insectsFound;
        document.getElementById('level').textContent = this.level;
        this.updateEnergyBar();
    }

    updateScientificData() {
        const distance = (this.lastEchoTime * 0.343 / 2).toFixed(2);
        const frequency = 40 + Math.random() * 120;
        const intensity = 70 + Math.random() * 30;
        const angle = 50 + Math.random() * 20;
        
        document.getElementById('echoTime').textContent = this.lastEchoTime + 'ms';
        document.getElementById('distance').textContent = distance + 'm';
        document.getElementById('frequency').textContent = frequency.toFixed(1) + 'kHz';
        document.getElementById('intensity').textContent = intensity.toFixed(1) + 'dB';
        document.getElementById('angle').textContent = angle.toFixed(1) + '°';
    }

    drawWaveform() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 20) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, this.canvas.height);
            ctx.stroke();
        }
        
        // Draw waveform
        ctx.strokeStyle = '#00bfff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < this.canvas.width; x++) {
            const frequency = 0.1;
            const amplitude = 20;
            const y = this.canvas.height / 2 + Math.sin(x * frequency) * amplitude;
            
            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw echo
        ctx.strokeStyle = '#ffa500';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        const echoStart = this.canvas.width * 0.7;
        for (let x = echoStart; x < this.canvas.width; x++) {
            const frequency = 0.15;
            const amplitude = 10;
            const y = this.canvas.height / 2 + Math.sin(x * frequency) * amplitude;
            
            if (x === echoStart) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }

    loadHighScore() {
        const saved = localStorage.getItem('bat_highscore');
        if (saved) {
            this.highscore = parseInt(saved);
            document.getElementById('highscore').textContent = this.highscore;
        } else {
            this.highscore = 0;
        }
    }

    saveHighScore() {
        if (this.score > this.highscore) {
            this.highscore = this.score;
            localStorage.setItem('bat_highscore', this.highscore);
            document.getElementById('highscore').textContent = this.highscore;
        }
    }

    playPingSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// Initialize the simulator
const simulator = new BatEcholocationSimulator();