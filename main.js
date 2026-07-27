// ========================================
// 书桌空间 - Three.js 原型
// 无折角背景 + 360度旋转 + 点击放大弹窗
// ========================================

let scene, camera, renderer;
let roomObjects = {};
let raycaster, mouse;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = { theta: -Math.PI / 4, phi: 1.1 };
let cameraDistance = 9;
let targetPosition = new THREE.Vector3(0, 1.5, -3.0);
let isAnimating = false;
let hoveredObject = null;
let selectedObject = null;

const COLORS = {
    white: 0xf5f5f0,
    silver: 0xc0c0c0,
    gray: 0x8a8a8a,
    darkGray: 0x3a3a3a,
    black: 0x1a1a1a,
    wood: 0xd4a574,
    woodLight: 0xe8c9a0,
    woodDark: 0x8b6914,
    accent: 0x0071e3,
    accentLight: 0x5ac8fa,
    warm: 0xff9500,
    green: 0x34c759,
    red: 0xff3b30,
    rug: 0xc4956a,
    wall: 0xe8e4e0,
    floor: 0xd5d0cc
};

const objectData = {
    laptop: {
        name: '笔记本电脑',
        icon: '💻',
        desc: '工作经历与项目',
        content: `
            <h3>🏢 高级产品经理</h3>
            <p class="time">2022 - 至今 · 互联网大厂</p>
            <ul>
                <li>主导用户增长产品，DAU 提升 35%</li>
                <li>负责 AI 产品化落地，服务 100万+ 用户</li>
                <li>推动跨团队协作，交付 10+ 个核心项目</li>
            </ul>
            <div class="divider"></div>
            <h3>🚀 AIPMate</h3>
            <p class="time">2024 - 至今 · 个人项目</p>
            <p>AI 驱动的内容批量生产工具，帮助 MCN 机构提升效率 10倍+</p>
        `
    },
    chair: {
        name: '关于我',
        icon: '🪑',
        desc: '个人简介',
        content: `
            <h3>👋 你好，我是 Bigpeng</h3>
            <p>一个热爱技术和产品的人，喜欢探索 AI 与创意的结合。</p>
            <div class="divider"></div>
            <p>📍 北京</p>
            <p>💼 产品经理 / 全栈开发者</p>
            <p>🎯 专注 AI 产品化、内容创作工具</p>
        `
    },
    lamp: {
        name: '技能专长',
        icon: '💡',
        desc: '技术能力',
        content: `
            <h3>💻 技术栈</h3>
            <div class="skill-tags">
                <span class="tag">React</span>
                <span class="tag">TypeScript</span>
                <span class="tag">Node.js</span>
                <span class="tag">Python</span>
                <span class="tag">Three.js</span>
                <span class="tag">AI/LLM</span>
            </div>
            <div class="divider"></div>
            <h3>📐 产品能力</h3>
            <ul>
                <li>产品规划与需求分析</li>
                <li>数据驱动决策</li>
                <li>用户体验设计</li>
                <li>敏捷项目管理</li>
            </ul>
        `
    },
    coffee: {
        name: '联系方式',
        icon: '☕',
        desc: '找到我',
        content: `
            <h3>📮 联系我</h3>
            <div class="contact-list">
                <div class="contact-item">
                    <span class="contact-icon">✉️</span>
                    <span>hello@bigpeng.dev</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">💻</span>
                    <span>github.com/bigpeng</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">🐦</span>
                    <span>@bigpeng</span>
                </div>
            </div>
        `
    },
    guitar: {
        name: '音乐爱好',
        icon: '🎸',
        desc: '吉他 / 音乐',
        content: `
            <h3>🎵 音乐世界</h3>
            <p>弹吉他 5 年，喜欢 indie 和民谣。</p>
            <div class="divider"></div>
            <h3>🎧 最近在听</h3>
            <ul>
                <li>Radiohead - Creep</li>
                <li>告五人 - 爱人错过</li>
                <li>橘子海 - 夏日漱石</li>
            </ul>
        `
    },
    camera: {
        name: '摄影作品',
        icon: '📷',
        desc: '摄影记录',
        content: `
            <h3>📸 镜头下的世界</h3>
            <p>喜欢用相机记录生活中的美好瞬间。</p>
            <div class="divider"></div>
            <h3>🎞️ 常用设备</h3>
            <ul>
                <li>Sony A7M4</li>
                <li>35mm f/1.4 GM</li>
                <li>iPhone 15 Pro</li>
            </ul>
        `
    },
    bookshelf: {
        name: '教育背景',
        icon: '📚',
        desc: '学习与成长',
        content: `
            <h3>🎓 硕士 · 计算机科学</h3>
            <p class="time">2018 - 2020</p>
            <p>研究方向：人机交互与智能界面</p>
            <div class="divider"></div>
            <h3>🎓 本科 · 软件工程</h3>
            <p class="time">2014 - 2018</p>
            <p>GPA 3.8/4.0，ACM 区域赛铜奖</p>
        `
    },
    musicStand: {
        name: '音乐品味',
        icon: '🎵',
        desc: '黑胶 / Spotify',
        content: `
            <h3>🎶 音乐收藏</h3>
            <p>黑胶唱片爱好者，收藏 50+ 张经典专辑。</p>
            <div class="divider"></div>
            <h3>📀 收藏精选</h3>
            <ul>
                <li> Pink Floyd - Dark Side of the Moon</li>
                <li> Beatles - Abbey Road</li>
                <li> 周杰伦 - 范特西</li>
            </ul>
        `
    },
    frame1: {
        name: '生活瞬间',
        icon: '🖼️',
        desc: '日常记录',
        content: `
            <h3>📷 生活碎片</h3>
            <p>记录平凡日子里的闪光时刻。</p>
            <div class="divider"></div>
            <p>🏔️ 川西徒步</p>
            <p>🌊 青岛看海</p>
            <p>☕ 胡同咖啡</p>
        `
    },
    frame2: {
        name: '旅行足迹',
        icon: '🖼️',
        desc: '探索世界',
        content: `
            <h3>🌍 走过的路</h3>
            <p>用脚步丈量世界，用镜头记录风景。</p>
            <div class="divider"></div>
            <p>🇯🇵 日本 · 京都红叶</p>
            <p>🇹🇭 泰国 · 清迈慢生活</p>
            <p>🇨🇳 新疆 · 独库公路</p>
        `
    },
    whiteboard: {
        name: '技术栈',
        icon: '📝',
        desc: '技能标签',
        content: `
            <h3>🏷️ 技能图谱</h3>
            <div class="skill-tags">
                <span class="tag primary">产品设计</span>
                <span class="tag primary">前端开发</span>
                <span class="tag">React</span>
                <span class="tag">Vue</span>
                <span class="tag">TypeScript</span>
                <span class="tag">Node.js</span>
                <span class="tag">Python</span>
                <span class="tag">Three.js</span>
                <span class="tag">AI/LLM</span>
                <span class="tag">数据分析</span>
            </div>
        `
    },
    bike: {
        name: '骑行',
        icon: '🚴',
        desc: '公路车',
        content: `
            <h3>🚴 骑行日志</h3>
            <p>公路车爱好者，享受风与自由。</p>
            <div class="divider"></div>
            <h3>📊 数据</h3>
            <ul>
                <li>总里程：3,000+ km</li>
                <li>单次最长：120 km</li>
                <li>爱车：Trek Domane</li>
            </ul>
        `
    }
};

function init() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(COLORS.wall);

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
        updateCameraPosition();

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();

        createLighting();
        createRoom();
        createDesk();
        createChair();
        createLaptop();
        createLamp();
        createCoffee();
        createGuitar();
        createCamera();
        createWallShelf();
        createMusicCabinet();
        createFrames();
        createWhiteboard();
        createBike();
        createCarpet();

        setupEventListeners();
        createModal();

        setTimeout(() => {
            document.getElementById('loading').classList.add('hidden');
        }, 600);

        animate();
    } catch (e) {
        console.error('初始化失败:', e);
        document.getElementById('loading').innerHTML = '<p>加载失败，请刷新页面重试</p>';
    }
}

// ========================================
// 光照系统
// ========================================
function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff8f0, 1.5);
    mainLight.position.set(3, 6, 4);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    mainLight.shadow.bias = -0.0005;
    mainLight.shadow.radius = 4;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.2);
    fillLight.position.set(-3, 5, 2);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xfff8f0, 0xd5d0cc, 0.3);
    scene.add(hemiLight);
}

// ========================================
// 房间 - 无折角，无限延伸感
// ========================================
function createRoom() {
    // 地板 - 大面积，无边界感
    const floorGeo = new THREE.PlaneGeometry(60, 60);
    const floorMat = new THREE.MeshStandardMaterial({
        color: COLORS.floor,
        roughness: 0.95,
        metalness: 0.0
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);

    // 背景墙 - 只有一面，无侧墙无折角
    const wallGeo = new THREE.PlaneGeometry(30, 14);
    const wallMat = new THREE.MeshStandardMaterial({
        color: COLORS.wall,
        roughness: 0.95,
        metalness: 0.0
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 7, -5.95);
    wall.receiveShadow = true;
    scene.add(wall);
}

// ========================================
// 书桌
// ========================================
function createDesk() {
    const group = new THREE.Group();

    const topGeo = new THREE.BoxGeometry(4.2, 0.06, 2.0);
    const topMat = new THREE.MeshStandardMaterial({
        color: COLORS.white,
        roughness: 0.3,
        metalness: 0.05
    });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = 1.5;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    const legGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
    const legMat = new THREE.MeshStandardMaterial({
        color: COLORS.woodLight,
        roughness: 0.6,
        metalness: 0.05
    });
    const legPositions = [[-1.9, 0.75, 0.85], [1.9, 0.75, 0.85], [-1.9, 0.75, -0.85], [1.9, 0.75, -0.85]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });

    group.position.set(0, 0, -3.5);
    scene.add(group);
}

// ========================================
// 电竞椅
// ========================================
function createChair() {
    const group = new THREE.Group();

    const seatGeo = new THREE.BoxGeometry(1.1, 0.1, 1.0);
    const seatMat = new THREE.MeshStandardMaterial({ color: COLORS.darkGray, roughness: 0.6 });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.y = 1.0;
    seat.castShadow = true;
    group.add(seat);

    const backGeo = new THREE.BoxGeometry(1.1, 1.3, 0.08);
    const back = new THREE.Mesh(backGeo, seatMat);
    back.position.set(0, 1.6, -0.5);
    back.rotation.x = -0.12;
    back.castShadow = true;
    group.add(back);

    const headGeo = new THREE.BoxGeometry(0.5, 0.2, 0.1);
    const headMat = new THREE.MeshStandardMaterial({ color: COLORS.black });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.set(0, 2.2, -0.55);
    head.rotation.x = -0.12;
    group.add(head);

    const armGeo = new THREE.BoxGeometry(0.06, 0.5, 0.5);
    const armMat = new THREE.MeshStandardMaterial({ color: COLORS.black });
    [-0.6, 0.6].forEach(x => {
        const arm = new THREE.Mesh(armGeo, armMat);
        arm.position.set(x, 1.25, 0);
        group.add(arm);
    });

    const baseGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: COLORS.silver, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.4;
    group.add(base);

    const stemGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.55, 12);
    const stem = new THREE.Mesh(stemGeo, baseMat);
    stem.position.y = 0.7;
    group.add(stem);

    const wheelGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.035, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: COLORS.black });
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(Math.cos(angle) * 0.35, 0.055, Math.sin(angle) * 0.35);
        wheel.rotation.z = Math.PI / 2;
        group.add(wheel);
    }

    group.position.set(0, 0, -1.2);
    group.rotation.y = Math.PI / 4;
    group.userData = { name: 'chair', displayName: '关于我' };
    scene.add(group);
    roomObjects.chair = group;
}

// ========================================
// 笔记本电脑
// ========================================
function createLaptop() {
    const group = new THREE.Group();

    const baseGeo = new THREE.BoxGeometry(1.1, 0.025, 0.75);
    const baseMat = new THREE.MeshStandardMaterial({ color: COLORS.darkGray, roughness: 0.3, metalness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.castShadow = true;
    group.add(base);

    const lidGeo = new THREE.BoxGeometry(1.1, 0.75, 0.025);
    const lid = new THREE.Mesh(lidGeo, baseMat);
    lid.position.set(0, 0.375, -0.375);
    lid.rotation.x = -0.18;
    lid.castShadow = true;
    group.add(lid);

    const screenGeo = new THREE.BoxGeometry(1.0, 0.65, 0.005);
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.1 });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.375, -0.365);
    screen.rotation.x = -0.18;
    group.add(screen);

    const kbGeo = new THREE.BoxGeometry(0.9, 0.005, 0.5);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(0, 0.03, 0.04);
    group.add(kb);

    const trackGeo = new THREE.BoxGeometry(0.3, 0.005, 0.18);
    const track = new THREE.Mesh(trackGeo, baseMat);
    track.position.set(0, 0.03, 0.25);
    group.add(track);

    group.position.set(0.6, 1.53, -3.5);
    group.userData = { name: 'laptop', displayName: '工作经历' };
    scene.add(group);
    roomObjects.laptop = group;
}

// ========================================
// 台灯
// ========================================
function createLamp() {
    const group = new THREE.Group();

    const baseGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.025, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.3, metalness: 0.5 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    group.add(base);

    const poleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.45, 12);
    const pole = new THREE.Mesh(poleGeo, baseMat);
    pole.position.y = 0.225;
    group.add(pole);

    const jointGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const joint = new THREE.Mesh(jointGeo, baseMat);
    joint.position.y = 0.45;
    group.add(joint);

    const armGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 12);
    const arm = new THREE.Mesh(armGeo, baseMat);
    arm.position.set(0.1, 0.55, 0);
    arm.rotation.z = -0.6;
    group.add(arm);

    const shadeGeo = new THREE.ConeGeometry(0.08, 0.1, 32, 1, true);
    const shadeMat = new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide });
    const shade = new THREE.Mesh(shadeGeo, shadeMat);
    shade.position.set(0.18, 0.5, 0);
    shade.rotation.z = 0.4;
    group.add(shade);

    const bulbGeo = new THREE.SphereGeometry(0.025, 12, 12);
    const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff8e7, emissive: 0xfff8e7, emissiveIntensity: 0.5 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(0.18, 0.47, 0);
    group.add(bulb);

    const lampLight = new THREE.PointLight(0xfff0d0, 0.35, 3);
    lampLight.position.set(0.18, 0.43, 0);
    group.add(lampLight);

    group.position.set(-1.0, 1.53, -3.5);
    group.userData = { name: 'lamp', displayName: '技能专长' };
    scene.add(group);
    roomObjects.lamp = group;
}

// ========================================
// 咖啡杯
// ========================================
function createCoffee() {
    const group = new THREE.Group();

    const cupGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.1, 24);
    const cupMat = new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.4, metalness: 0.1 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.y = 0.05;
    cup.castShadow = true;
    group.add(cup);

    const handleGeo = new THREE.TorusGeometry(0.03, 0.005, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeo, cupMat);
    handle.position.set(0.06, 0.05, 0);
    handle.rotation.z = -Math.PI / 2;
    group.add(handle);

    const coffeeGeo = new THREE.CircleGeometry(0.05, 24);
    const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x2d1810, roughness: 0.2 });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.y = 0.095;
    coffee.rotation.x = -Math.PI / 2;
    group.add(coffee);

    const coasterGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.004, 24);
    const coasterMat = new THREE.MeshStandardMaterial({ color: COLORS.woodDark });
    const coaster = new THREE.Mesh(coasterGeo, coasterMat);
    group.add(coaster);

    group.position.set(-0.3, 1.53, -3.5);
    group.userData = { name: 'coffee', displayName: '联系方式' };
    scene.add(group);
    roomObjects.coffee = group;
}

// ========================================
// 吉他
// ========================================
function createGuitar() {
    const group = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(0.4, 0.55, 0.07);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xc4a574, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.275;
    body.castShadow = true;
    group.add(body);

    const holeGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.015, 24);
    const hole = new THREE.Mesh(holeGeo, new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    hole.position.set(0, 0.3, 0.035);
    hole.rotation.x = Math.PI / 2;
    group.add(hole);

    const neckGeo = new THREE.BoxGeometry(0.06, 0.5, 0.02);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x2d1810 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.set(0, 0.75, 0);
    group.add(neck);

    const headGeo = new THREE.BoxGeometry(0.08, 0.1, 0.03);
    const head = new THREE.Mesh(headGeo, neckMat);
    head.position.set(0, 1.05, 0);
    group.add(head);

    const standGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.7, 8);
    const standMat = new THREE.MeshStandardMaterial({ color: COLORS.black });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.set(0, 0.35, -0.1);
    group.add(stand);

    const standBaseGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.012, 3);
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.position.set(0, 0.01, -0.1);
    group.add(standBase);

    group.position.set(-1.6, 0, -3.3);
    group.rotation.y = 0.15;
    group.userData = { name: 'guitar', displayName: '音乐爱好' };
    scene.add(group);
    roomObjects.guitar = group;
}

// ========================================
// 相机
// ========================================
function createCamera() {
    const group = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(0.2, 0.14, 0.09);
    const bodyMat = new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.3, metalness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.07;
    body.castShadow = true;
    group.add(body);

    const lensGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.06, 24);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.1, metalness: 0.5 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.set(0, 0.07, 0.06);
    lens.rotation.x = Math.PI / 2;
    group.add(lens);

    const glassGeo = new THREE.CircleGeometry(0.05, 24);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.05, metalness: 0.9 });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 0.07, 0.095);
    group.add(glass);

    const strapGeo = new THREE.TorusGeometry(0.22, 0.01, 8, 32, Math.PI);
    const strap = new THREE.Mesh(strapGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
    strap.position.set(0, 0.12, 0);
    group.add(strap);

    group.position.set(1.6, 1.53, -3.5);
    group.rotation.y = -0.2;
    group.userData = { name: 'camera', displayName: '摄影作品' };
    scene.add(group);
    roomObjects.camera = group;
}

// ========================================
// 立式书架 - 紧靠书桌右侧
// ========================================
function createWallShelf() {
    const group = new THREE.Group();

    // 书架框架
    const frameGeo = new THREE.BoxGeometry(1.0, 2.5, 0.35);
    const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.woodLight, roughness: 0.6 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 1.25;
    frame.castShadow = true;
    group.add(frame);

    // 隔板
    const shelfGeo = new THREE.BoxGeometry(0.92, 0.03, 0.32);
    const shelfMat = new THREE.MeshStandardMaterial({ color: COLORS.woodDark });
    for (let i = 0; i < 5; i++) {
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(0, 0.3 + i * 0.5, 0);
        shelf.castShadow = true;
        group.add(shelf);
    }

    // 放满书籍
    const bookColors = [
        0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad,
        0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6,
        0xd35400, 0x1abc9c, 0x16a085, 0xe67e22, 0x2c3e50
    ];
    
    for (let row = 0; row < 4; row++) {
        let xPos = -0.38;
        const yPos = 0.3 + row * 0.5 + 0.02;
        
        // 每层放8-10本书
        for (let b = 0; b < 10; b++) {
            const h = 0.35 + Math.random() * 0.12;
            const w = 0.04 + Math.random() * 0.04;
            const d = 0.28 + Math.random() * 0.03;
            
            if (xPos + w > 0.4) break;
            
            const bookGeo = new THREE.BoxGeometry(w, h, d);
            const bookMat = new THREE.MeshStandardMaterial({
                color: bookColors[Math.floor(Math.random() * bookColors.length)],
                roughness: 0.6
            });
            const book = new THREE.Mesh(bookGeo, bookMat);
            book.position.set(xPos + w / 2, yPos + h / 2, 0);
            book.castShadow = true;
            group.add(book);
            
            xPos += w + 0.01;
        }
    }

    // 书架紧靠书桌右侧（书桌在 x=0, z=-3.5, 宽度4.2）
    group.position.set(2.8, 0, -3.5);
    group.userData = { name: 'bookshelf', displayName: '教育背景' };
    scene.add(group);
    roomObjects.bookshelf = group;
}

// ========================================
// 音乐矮柜
// ========================================
function createMusicCabinet() {
    const group = new THREE.Group();

    const cabinetGeo = new THREE.BoxGeometry(1.4, 0.7, 0.6);
    const cabinetMat = new THREE.MeshStandardMaterial({ color: COLORS.darkGray, roughness: 0.5 });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.y = 0.35;
    cabinet.castShadow = true;
    group.add(cabinet);

    // 抽屉缝隙
    const lineGeo = new THREE.BoxGeometry(1.35, 0.005, 0.005);
    const lineMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.set(0, 0.35, 0.3);
    group.add(line);

    // 唱片机
    const platterGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.012, 32);
    const platterMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2 });
    const platter = new THREE.Mesh(platterGeo, platterMat);
    platter.position.set(-0.15, 0.71, 0);
    group.add(platter);

    const vinylGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.005, 32);
    const vinylMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.1 });
    const vinyl = new THREE.Mesh(vinylGeo, vinylMat);
    vinyl.position.set(-0.15, 0.718, 0);
    group.add(vinyl);

    const labelGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.006, 24);
    const labelMat = new THREE.MeshStandardMaterial({ color: COLORS.accent });
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(-0.15, 0.722, 0);
    group.add(label);

    // 唱臂
    const armBaseGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.03, 12);
    const armMat = new THREE.MeshStandardMaterial({ color: COLORS.silver, metalness: 0.8 });
    const armBase = new THREE.Mesh(armBaseGeo, armMat);
    armBase.position.set(0.15, 0.73, 0.1);
    group.add(armBase);

    const armStickGeo = new THREE.BoxGeometry(0.012, 0.012, 0.2);
    const armStick = new THREE.Mesh(armStickGeo, armMat);
    armStick.position.set(0.15, 0.75, 0);
    group.add(armStick);

    // 靠垫
    const pillowGeo = new THREE.BoxGeometry(0.5, 0.08, 0.35);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xddd8d0, roughness: 0.9 });
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.position.set(0.35, 0.74, -0.05);
    pillow.rotation.z = 0.05;
    group.add(pillow);

    group.position.set(-3.2, 0, -3.5);
    group.userData = { name: 'musicStand', displayName: '音乐品味' };
    scene.add(group);
    roomObjects.musicStand = group;
}

// ========================================
// 相框
// ========================================
function createFrames() {
    const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.3, metalness: 0.4 });

    // 相框1 - 小红书
    const group1 = new THREE.Group();
    const border1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.04), frameMat);
    group1.add(border1);
    const inner1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.42, 0.01),
        new THREE.MeshStandardMaterial({ color: COLORS.red, roughness: 0.5 })
    );
    inner1.position.z = 0.02;
    group1.add(inner1);
    group1.position.set(-2.0, 3.4, -5.92);
    group1.userData = { name: 'frame1', displayName: '生活瞬间' };
    scene.add(group1);
    roomObjects.frame1 = group1;

    // 相框2 - GitHub
    const group2 = new THREE.Group();
    const border2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.04), frameMat);
    group2.add(border2);
    const inner2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.42, 0.01),
        new THREE.MeshStandardMaterial({ color: 0x24292e, roughness: 0.5 })
    );
    inner2.position.z = 0.02;
    group2.add(inner2);
    group2.position.set(-2.0, 2.7, -5.92);
    group2.userData = { name: 'frame2', displayName: '代码生活' };
    scene.add(group2);
    roomObjects.frame2 = group2;

    // 大照片 - 右侧
    const group3 = new THREE.Group();
    const border3 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, 0.04), frameMat);
    group3.add(border3);
    const inner3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.2, 0.01),
        new THREE.MeshStandardMaterial({ color: 0x2a3f5f, roughness: 0.5 })
    );
    inner3.position.z = 0.02;
    group3.add(inner3);
    group3.position.set(2.2, 3.4, -5.92);
    group3.userData = { name: 'frame2', displayName: '旅行足迹' };
    scene.add(group3);
}

// ========================================
// 白板
// ========================================
function createWhiteboard() {
    const group = new THREE.Group();

    // 白板主体 - 使用BasicMaterial确保始终可见
    const boardGeo = new THREE.BoxGeometry(1.8, 1.0, 0.02);
    const boardMat = new THREE.MeshBasicMaterial({ color: 0xf5f5f0 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);

    // 边框
    const frameGeo = new THREE.BoxGeometry(1.9, 1.1, 0.015);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.z = -0.005;
    group.add(frame);

    // 便利贴
    const noteColors = [COLORS.warm, COLORS.accentLight, COLORS.green];
    const notePositions = [[-0.7, 0.3], [0.0, 0.35], [0.6, 0.25]];
    notePositions.forEach((pos, i) => {
        const noteGeo = new THREE.BoxGeometry(0.2, 0.2, 0.005);
        const noteMat = new THREE.MeshStandardMaterial({ color: noteColors[i], roughness: 0.8 });
        const note = new THREE.Mesh(noteGeo, noteMat);
        note.position.set(pos[0], pos[1], 0.02);
        note.rotation.z = (Math.random() - 0.5) * 0.15;
        group.add(note);
    });

    group.position.set(-0.2, 3.8, -5.92);
    group.userData = { name: 'whiteboard', displayName: '技术栈' };
    scene.add(group);
    roomObjects.whiteboard = group;
}

// ========================================
// 自行车
// ========================================
function createBike() {
    const group = new THREE.Group();

    // 简化自行车 - 用基本几何体表示
    const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.3, metalness: 0.5 });

    // 车架主体
    const mainTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 8), frameMat);
    mainTube.position.set(0, 0.5, 0);
    mainTube.rotation.z = 0.3;
    group.add(mainTube);

    // 座管
    const seatTube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8), frameMat);
    seatTube.position.set(-0.15, 0.55, 0);
    group.add(seatTube);

    // 前叉
    const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), frameMat);
    fork.position.set(0.25, 0.35, 0);
    fork.rotation.z = -0.25;
    group.add(fork);

    // 后轮
    const wheelGeo = new THREE.TorusGeometry(0.22, 0.012, 8, 32);
    const wheelMat = new THREE.MeshStandardMaterial({ color: COLORS.black });
    const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
    backWheel.position.set(-0.2, 0.22, 0);
    group.add(backWheel);

    // 前轮
    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0.3, 0.22, 0);
    group.add(frontWheel);

    // 车座
    const seatGeo = new THREE.BoxGeometry(0.12, 0.03, 0.08);
    const seatMat = new THREE.MeshStandardMaterial({ color: COLORS.black });
    const seat = new THREE.Mesh(seatGeo, seatMat);
    seat.position.set(-0.15, 0.8, 0);
    group.add(seat);

    // 车把
    const handleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.3, 8);
    const handleBar = new THREE.Mesh(handleGeo, frameMat);
    handleBar.position.set(0.3, 0.58, 0);
    handleBar.rotation.x = Math.PI / 2;
    group.add(handleBar);

    group.position.set(3.5, 0, -3.5);
    group.rotation.y = -0.4;
    group.userData = { name: 'bike', displayName: '骑行' };
    scene.add(group);
    roomObjects.bike = group;
}

// ========================================
// 地毯
// ========================================
function createCarpet() {
    const carpetGeo = new THREE.PlaneGeometry(5, 3.5);
    const carpetMat = new THREE.MeshStandardMaterial({
        color: COLORS.rug,
        roughness: 1.0,
        metalness: 0.0
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.005, -2.5);
    carpet.receiveShadow = true;
    scene.add(carpet);
}

// ========================================
// 弹窗系统
// ========================================
function createModal() {
    const modal = document.createElement('div');
    modal.id = 'modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close">×</button>
            <div class="modal-header">
                <span class="modal-icon" id="modal-icon"></span>
                <h2 class="modal-title" id="modal-title"></h2>
            </div>
            <div class="modal-body" id="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
}

function showModal(objectName) {
    const data = objectData[objectName];
    if (!data) return;

    document.getElementById('modal-icon').textContent = data.icon;
    document.getElementById('modal-title').textContent = data.name;
    document.getElementById('modal-body').innerHTML = data.content;
    document.getElementById('modal').classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    selectedObject = null;
    // 恢复相机到正面视角（桌子前方看向桌面）
    animateCameraTo(0, 1.35, 8, new THREE.Vector3(0, 1.5, -3.0));
}

// ========================================
// 相机动画
// ========================================
function animateCameraTo(targetTheta, targetPhi, targetDistance, targetLookAt) {
    isAnimating = true;
    const startTheta = cameraAngle.theta;
    const startPhi = cameraAngle.phi;
    const startDistance = cameraDistance;
    const startLookAt = targetPosition.clone();
    let progress = 0;

    function step() {
        progress += 0.03;
        if (progress >= 1) {
            progress = 1;
            isAnimating = false;
        }

        const t = easeInOutCubic(progress);
        cameraAngle.theta = startTheta + (targetTheta - startTheta) * t;
        cameraAngle.phi = startPhi + (targetPhi - startPhi) * t;
        cameraDistance = startDistance + (targetDistance - startDistance) * t;
        targetPosition.lerpVectors(startLookAt, targetLookAt, t);
        updateCameraPosition();

        if (isAnimating) requestAnimationFrame(step);
    }
    step();
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ========================================
// 事件监听
// ========================================
function setupEventListeners() {
    const canvas = renderer.domElement;

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        if (isDragging && !isAnimating && !selectedObject) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            cameraAngle.theta += deltaX * 0.006;
            cameraAngle.phi += deltaY * 0.006;
            cameraAngle.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.05, cameraAngle.phi));
            cameraAngle.theta = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraAngle.theta));
            updateCameraPosition();
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }

        checkHover(e.clientX, e.clientY);
    });

    canvas.addEventListener('mouseup', (e) => {
        const deltaX = Math.abs(e.clientX - previousMousePosition.x);
        isDragging = false;

        // 只有没有拖拽（点击）时才触发
        if (deltaX < 5 && !isAnimating) {
            handleClick();
        }
    });

    canvas.addEventListener('mouseleave', () => { isDragging = false; });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 触摸支持 - 左右滑动旋转（单指和双指）
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartDistance = 0;
    let isTouchDragging = false;

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            isTouchDragging = true;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            previousMousePosition = { x: touchStartX, y: touchStartY };
        } else if (e.touches.length === 2) {
            // 双指缩放
            isTouchDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDistance = Math.sqrt(dx * dx + dy * dy);
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isTouchDragging && !isAnimating && !selectedObject) {
            const deltaX = e.touches[0].clientX - previousMousePosition.x;
            const deltaY = e.touches[0].clientY - previousMousePosition.y;
            cameraAngle.theta += deltaX * 0.01;
            cameraAngle.phi += deltaY * 0.01;
            cameraAngle.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.05, cameraAngle.phi));
            cameraAngle.theta = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraAngle.theta));
            updateCameraPosition();
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            // 双指缩放
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const scale = touchStartDistance / distance;
            cameraDistance = Math.max(5, Math.min(18, cameraDistance * scale));
            touchStartDistance = distance;
            updateCameraPosition();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
            const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
            isTouchDragging = false;
            // 只有小幅度移动才认为是点击
            if (deltaX < 10 && deltaY < 10 && !isAnimating) {
                handleClick();
            }
        }
    });

    // 触控板支持 - wheel事件（双指左右滑动）
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.ctrlKey || e.metaKey) {
            // Ctrl/Command + 滚轮 = 缩放
            cameraDistance = Math.max(5, Math.min(18, cameraDistance + e.deltaY * 0.01));
        } else {
            // 触控板双指滑动 = 全方位旋转
            cameraAngle.theta += e.deltaX * 0.003;
            cameraAngle.phi += e.deltaY * 0.003;
            cameraAngle.phi = Math.max(0.3, Math.min(Math.PI / 2 - 0.05, cameraAngle.phi));
            cameraAngle.theta = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, cameraAngle.theta));
        }
        updateCameraPosition();
    }, { passive: false });
}

function updateCameraPosition() {
    const x = targetPosition.x + cameraDistance * Math.sin(cameraAngle.phi) * Math.sin(cameraAngle.theta);
    const y = targetPosition.y + cameraDistance * Math.cos(cameraAngle.phi);
    const z = targetPosition.z + cameraDistance * Math.sin(cameraAngle.phi) * Math.cos(cameraAngle.theta);
    camera.position.set(x, y, z);
    camera.lookAt(targetPosition);
}

function handleClick() {
    raycaster.setFromCamera(mouse, camera);
    const allObjects = [];
    Object.values(roomObjects).forEach(group => {
        group.traverse(child => { if (child.isMesh) allObjects.push(child); });
    });
    const intersects = raycaster.intersectObjects(allObjects);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.name) {
            obj = obj.parent;
        }
        if (obj.userData.name && objectData[obj.userData.name]) {
            selectedObject = obj;
            // 计算对象中心
            const box = new THREE.Box3().setFromObject(obj);
            const center = box.getCenter(new THREE.Vector3());
            // 相机移动到对象前方
            const offset = new THREE.Vector3(
                Math.sin(cameraAngle.theta) * 3,
                0.5,
                Math.cos(cameraAngle.theta) * 3
            );
            const camPos = center.clone().add(offset);
            const targetTheta = Math.atan2(camPos.x - center.x, camPos.z - center.z);
            animateCameraTo(targetTheta, 1.2, 4.5, center);
            setTimeout(() => showModal(obj.userData.name), 400);
        }
    }
}

function checkHover(clientX, clientY) {
    raycaster.setFromCamera(mouse, camera);
    const allObjects = [];
    Object.values(roomObjects).forEach(group => {
        group.traverse(child => { if (child.isMesh) allObjects.push(child); });
    });
    const intersects = raycaster.intersectObjects(allObjects);

    const tooltip = document.getElementById('tooltip');
    const canvasEl = renderer.domElement;

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.name) {
            obj = obj.parent;
        }
        if (obj.userData.name && objectData[obj.userData.name]) {
            const data = objectData[obj.userData.name];
            tooltip.innerHTML = `<strong>${data.icon} ${data.name}</strong>`;
            tooltip.style.left = clientX + 15 + 'px';
            tooltip.style.top = clientY + 15 + 'px';
            tooltip.classList.add('visible');
            canvasEl.classList.add('hovering');

            if (hoveredObject !== obj) {
                if (hoveredObject) setEmissive(hoveredObject, 0);
                hoveredObject = obj;
                setEmissive(hoveredObject, 0.08);
            }
            return;
        }
    }

    tooltip.classList.remove('visible');
    canvasEl.classList.remove('hovering');
    if (hoveredObject) {
        setEmissive(hoveredObject, 0);
        hoveredObject = null;
    }
}

function setEmissive(objectGroup, intensity) {
    objectGroup.traverse(child => {
        if (child.isMesh && child.material && child.material.emissive) {
            child.material.emissiveIntensity = intensity;
        }
    });
}

// ========================================
// 动画循环
// ========================================
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 唱片旋转
    if (roomObjects.musicStand) {
        const vinyl = roomObjects.musicStand.children.find(c =>
            c.geometry && c.geometry.type === 'CylinderGeometry' && c.position.y > 0.7
        );
        if (vinyl) vinyl.rotation.y = time * 0.5;
    }

    renderer.render(scene, camera);
}

init();
