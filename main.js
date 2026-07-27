// ========================================
// 书桌空间 - Three.js 原型
// 无折角背景 + 360度旋转 + 点击放大弹窗
// ========================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer;
let roomObjects = {};
let raycaster, mouse;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraAngle = { theta: -0.5, phi: 1.15 };
let cameraDistance = 8;
let targetPosition = new THREE.Vector3(0, 1.2, -3.0);
let isAnimating = false;
let hoveredObject = null;
let selectedObject = null;

// 音乐播放器
let bgMusic = null;
let isMusicPlaying = false;

// 台灯光源状态：0=冷光(默认), 1=暖光, 2=关灯
let lampMode = 0;
let mainLight, ambientLight, fillLight, hemiLight, lampLight, bulbMat;

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
    wall: 0xa29c96,
    floor: 0x9a948e
};

const bookDetails = [
    {
        cover: 'book1.png',
        title: '白夜行',
        author: '东野圭吾',
        desc: '1973年，大阪的一栋废弃建筑内发现了一具男尸，此后19年，嫌疑人之女雪穗与被害者之子桐原亮司走上截然不同的人生道路，一个跻身上流社会，一个却在底层游走，而他们身边的人，却接二连三地离奇死去，警察经过19年的艰苦追踪，终于使真相大白。',
        link: 'https://book.douban.com/subject/10554308/'
    },
    {
        cover: 'book2.png',
        title: '放学后',
        author: '东野圭吾',
        desc: '我在这所女子高中教数学五年了，日子风平浪静，但最近一切都变了。上周六去学校的路上，有人突然撞过来，我险些跌落铁轨；星期一放学后，我在学校淋浴，差点中机关触电；星期二放学后，我经过教学楼，从三楼飞出一个花盆砸向我头顶；星期四放学后，在我常用的更衣室内有人中毒死去，而且现场的门被人从里面顶住了。我报了警，自己也决心调查，没想到学校里又有人死去了，而我在回家的夜路上被人驾车猛然撞击。这一次放学后，我还躲得掉吗？',
        link: 'https://book.douban.com/subject/4074636/'
    },
    {
        cover: 'book3.png',
        title: '三体',
        author: '刘慈欣',
        desc: '文化大革命如火如荼进行的同时，军方探寻外星文明的绝秘计划"红岸工程"取得了突破性进展。但在按下发射键的那一刻，历经劫难的叶文洁没有意识到，她彻底改变了人类的命运。地球文明向宇宙发出的第一声啼鸣，以太阳为中心，以光速向宇宙深处飞驰……四光年外，"三体文明"正苦苦挣扎——三颗无规则运行的太阳主导下的百余次毁灭与重生逼迫他们逃离母星。而恰在此时，他们接收到了地球发来的信息。在运用超技术锁死地球人的基础科学之后，三体人庞大的宇宙舰队开始向地球进发……人类的末日悄然来临。',
        link: 'https://book.douban.com/subject/36892731/'
    },
    {
        cover: 'book4.png',
        title: '赡养人类',
        author: '刘慈欣',
        desc: '一个职业杀手接到一个奇怪的任务：杀死世界上最贫困的人。在追踪目标的过程中，他逐渐发现了一个惊人的真相——当贫富差距突破临界值，富人将不再是人。这是一个关于财富、人性和社会终极形态的寓言。',
        link: 'https://book.douban.com/subject/36740590/'
    },
    {
        cover: 'book5.png',
        title: '乡村教师',
        author: '刘慈欣',
        desc: '在西北一个偏僻的乡村，一位身患绝症的教师，在生命的最后时刻，坚持用最后的力气给孩子们上完最后一课——牛顿三定律。与此同时，在银河系中心，碳基联邦与硅基帝国的战争刚刚结束，联邦决定建立隔离带，摧毁隔离带中所有恒星。地球正处于隔离带边缘，而拯救地球的唯一标准，是检测该星球上的生命是否具备足够的文明水平……',
        link: 'https://book.douban.com/subject/10554308/'
    },
    {
        cover: 'book7.png',
        title: '始于极限：女性主义往复书简',
        author: '上野千鹤子',
        desc: '上野千鹤子×铃木凉美，最知名的女性主义先驱×最叛逆的人气作家，历时一年，十二次通信，每次一个主题，一场始于矛盾与冲突、通往理解与改变的对话。恋爱、性、婚姻、男人、工作、独立、自由……围绕12大主题，畅谈女性如何活出想要的人生。',
        link: 'https://book.douban.com/subject/35966120/'
    },
    {
        cover: 'book6.png',
        title: '天价小娇妻：总裁的33日索情',
        author: '银小宝',
        desc: '他是欧洲金融市场龙头厉家三少爷厉爵风，而她只是一个落魄千金顾小艾。一纸契约，他将她禁锢在身边，33天的囚禁，从互相厌恶到彼此深爱。当真相揭开，她才发现这场爱情背后隐藏着惊天秘密。霸道总裁与倔强千金的虐恋故事，甜宠与虐心交织。',
        link: 'https://www.kjyxys.com/txt977.html'
    }
];

const objectData = {
    laptop: {
        name: '笔记本电脑',
        icon: '💻',
        desc: '实习及创业经历',
        content: `
            <h3>🟡 美团 · AI产品经理</h3>
            <p class="time">2026.01 - 至今 · 核心本地商业_美团平台_渠道增长部</p>
            <ul>
                <li><strong>AI种草视频自动化生产：</strong>主导AI视频生产链路搭建，通过GLM视频理解等12个环节实现低成本爆款视频复刻+自动化生产。已承接闪购松鼠便利、拼好饭等业务视频需求，在cpm、订单转化等前后端指标上跑赢供应商。</li>
                <li><strong>小红书种草图文自动化生产：</strong>参与小红书图文AI生产中台建设，将爆款复刻拆解为图片理解/生图/拼图等原子能力落地为自动化Skill。内容成本由百元级降至1-2元，cpm、cpc远低于内部竞品及供应商。</li>
                <li><strong>AI审稿员工：</strong>开发AI审稿系统，针对达人内容进行大纲、脚本、成品三阶段，图片、文字、视频三形式的审核。AI审核流程为Brief解析->规则生成->逐项校验，v1上线审核非创意项准确率达70%。</li>
                <li><strong>灵感榜单：</strong>参与内容灵感榜单平台建设，协助打通各业务线投放数据接入，实现内容按互动、转化等指标的多维排名，支撑爆款内容洞察与选题决策。</li>
            </ul>
            <div class="divider"></div>
            <h3>🔴 百度 · AI产品经理</h3>
            <p class="time">2025.09 - 2026.01 · 搜索业务部_搜索内容_AIGC产品组</p>
            <ul>
                <li><strong>AI原生短视频生产链路搭建：</strong>gemini视频理解生成创意模板->文心生产创意实例->claude自动化评估创意脚本->sora生产视频，实现输入抖音高热视频输出复刻后的n个系列视频，投入到百度feed流实现获取高分发。</li>
                <li><strong>AI科普视频自动化生产链路搭建：</strong>针对百度百科长尾经济学术语词条进行AI视频定制化链路开发，基于科普物少量文本、图片，通过虚实结合、图片动态化等策略生产视频后填补2000+秒懂百科词条视频空缺。</li>
                <li><strong>模型评测及效果优化：</strong>参与自研模型评测（评估标准制定、评估报告产出等），拆解脚本质量差、主体畸变等问题，通过提示词优化、算子过滤等方法进行视频效果优化及模型迭代方向建议。</li>
                <li><strong>AI漫剧workflow搭建：</strong>coze搭建工作流实现AI漫剧自动化生产，使用即梦等AI工具手搓demo。</li>
            </ul>
            <div class="divider"></div>
            <h3>🔵 阵列格物科技 · AI产品运营</h3>
            <p class="time">2025.06 - 2025.09 · 创新产品部_AI产品组</p>
            <ul>
                <li><strong>AI聊天助手：</strong>为优化用户聊天破冰难（打招呼回复率10%），设计AI聊天助手实现回复率及聊天回合数的提升。</li>
                <li><strong>功能评测：</strong>评估动态流推荐策略，给出优化建议。评估AI聊天助手话术推荐效果，辅助产品迭代。</li>
                <li><strong>账号运营：</strong>使用Chatgpt、豆包等AIGC工具，辅助小红书、抖音运营，包括选题、文案生成、文生图片及视频。</li>
            </ul>
            <div class="divider"></div>
            <h3>🚀 自媒体博主 · 情感咨询工作室创始人</h3>
            <p class="time">2025.01 - 至今 · 独立创业</p>
            <ul>
                <li><strong>矩阵号运营：</strong>全网粉丝20w+，起号成功率100%，起号速度2个/月。打造涵盖两性情感（Maggie、Maggiee、月亮供电站、星翼软猫等）+大学生活（拒傲ao）两个赛道共10+账号，爆款率达25%。</li>
                <li><strong>商业化变现：</strong>情感赛道在更账号稳定变现20w+/月，独立跑通内容->引流->销售全流程。大学生活账号广告报价4000/条。</li>
                <li><strong>工作室管理：</strong>在职员工稳定为4位，独立招聘培训账号运营、剪辑、客服、销售，员工稳定在职自运转中。</li>
            </ul>
        `
    },
    chair: {
        name: '关于我',
        icon: '🪑',
        desc: '个人简介',
        content: `
            <p style="font-size:1.05rem;font-weight:500;text-align:center;margin:1.5rem 0;line-height:1.6;">在 AI 与内容的交叉地带做产品——既理解模型能力边界，也熟悉内容与流量逻辑。</p>
        `
    },
    lamp: {
        name: '台灯',
        icon: '💡',
        desc: '点击切换光源',
        content: `
            <h3>💡 台灯</h3>
            <p>点击台灯可切换三种光源模式：</p>
            <ul>
                <li>❄️ 冷白光 — 专注工作</li>
                <li>🔥 暖黄光 — 温馨氛围</li>
                <li>🌙 关闭 — 沉浸暗调</li>
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
                    <span class="contact-icon">📱</span>
                    <span>(+86) 182-4026-2776</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">✉️</span>
                    <span>liyixian2002@126.com</span>
                </div>
                <div class="contact-item">
                    <span class="contact-icon">💬</span>
                    <span>微信号：baoy_zoey_cap_Li</span>
                </div>
            </div>
        `
    },
    camera: {
        name: '我的猫咪',
        icon: '🐱',
        desc: '可爱小猫',
        content: `
            <h3>🐱 我的猫咪</h3>
            <p>一只陪伴我工作学习的小猫咪，最喜欢趴在书桌上晒太阳。</p>
            <div class="divider"></div>
            <p>🐾 名字：咪咪</p>
            <p>🎂 年龄：2岁</p>
            <p>❤️ 爱好：睡觉、追光点、蹭键盘</p>
        `
    },
    medal2: {
        name: '荣誉奖项',
        icon: '🏆',
        desc: '奖学金与竞赛',
        content: `
            <h4>🎓 奖学金</h4>
            <ul>
                <li>辽宁大学校级一等奖学金 × 3</li>
                <li>辽宁大学校级二等奖学金 × 2</li>
                <li>辽宁省优秀毕业生</li>
            </ul>
            <div class="divider"></div>
            <h4>🏅 竞赛获奖</h4>
            <ul>
                <li>叶圣陶杯国家三等奖</li>
                <li>第五届辽宁省企业竞争模拟大赛省级三等奖</li>
                <li>互联网+校级二等奖</li>
            </ul>
        `
    },
    bookshelf: {
        name: '书架',
        icon: '📚',
        desc: '我的书单',
        content: `
            <div class="book-grid" id="bookshelf-grid">
                <div class="book-card" data-book="0">
                    <img src="book1.png" class="book-cover-img" alt="白夜行">
                    <span class="book-name">白夜行</span>
                    <span class="book-author">东野圭吾</span>
                </div>
                <div class="book-card" data-book="1">
                    <img src="book2.png" class="book-cover-img" alt="放学后">
                    <span class="book-name">放学后</span>
                    <span class="book-author">东野圭吾</span>
                </div>
                <div class="book-card" data-book="2">
                    <img src="book3.png" class="book-cover-img" alt="三体">
                    <span class="book-name">三体</span>
                    <span class="book-author">刘慈欣</span>
                </div>
                <div class="book-card" data-book="3">
                    <img src="book4.png" class="book-cover-img" alt="赡养人类">
                    <span class="book-name">赡养人类</span>
                    <span class="book-author">刘慈欣</span>
                </div>
                <div class="book-card" data-book="4">
                    <img src="book5.png" class="book-cover-img" alt="乡村教师">
                    <span class="book-name">乡村教师</span>
                    <span class="book-author">刘慈欣</span>
                </div>
                <div class="book-card" data-book="5">
                    <img src="book7.png" class="book-cover-img" alt="始于极限">
                    <span class="book-name">始于极限</span>
                    <span class="book-author">上野千鹤子</span>
                </div>
                <div class="book-card" data-book="6">
                    <img src="book6.png" class="book-cover-img" alt="天价小娇妻">
                    <span class="book-name">天价小娇妻</span>
                    <span class="book-author">银小宝</span>
                </div>
            </div>
        `
    },
    musicStand: {
        name: '运动 & 音乐',
        icon: '🎸',
        desc: '吉他 / 网球 / 羽毛球',
        content: `
            <h3>🎸 吉他</h3>
            <p>民谣吉他爱好者，喜欢弹唱和指弹。</p>
            <div class="divider"></div>
            <h3>🎾 网球</h3>
            <p>每周至少打一次，享受球场上的专注与释放。</p>
            <div class="divider"></div>
            <h3>🏸 羽毛球</h3>
            <p>双打爱好者，擅长前场封网和快速反击。</p>
        `
    },
    frame1: {
        name: '小红书矩阵',
        icon: '📕',
        desc: '3个运营账号',
        content: `
            <div class="account-grid">
                <a href="https://xhslink.com/m/1fZLE1mQan1" class="account-card" target="_blank" rel="noopener">
                    <img src="avatar1.png" class="account-avatar-img" alt="Maggie">
                    <span class="account-name">Maggie</span>
                </a>
                <a href="https://xhslink.com/m/9yr9GatR8GP" class="account-card" target="_blank" rel="noopener">
                    <img src="avatar2.png" class="account-avatar-img" alt="Maggiee">
                    <span class="account-name">Maggiee</span>
                </a>
                <a href="https://xhslink.com/m/566ko5W4Hji" class="account-card" target="_blank" rel="noopener">
                    <img src="avatar3.png" class="account-avatar-img" alt="月亮供电站">
                    <span class="account-name">月亮供电站</span>
                </a>
            </div>
            <div class="divider"></div>
            <h3>📊 账号数据</h3>
            <ul>
                <li>全网粉丝 <strong>20w+</strong></li>
                <li>起号成功率 <strong>100%</strong>，起号速度 <strong>2个/月</strong></li>
                <li>两性情感赛道共有 <strong>10+ 矩阵账号</strong></li>
                <li>爆款率达 <strong>25%</strong></li>
            </ul>
            <div class="divider"></div>
            <h3>💰 商业化</h3>
            <p>在更账号稳定变现 <strong>20w+/月</strong>，独立跑通内容 → 引流 → 销售全流程。</p>
            <div class="divider"></div>
            <h3>👥 工作室管理</h3>
            <ul>
                <li>在职员工稳定为 <strong>4位</strong></li>
                <li>独立招聘培训账号运营、剪辑、客服、销售</li>
                <li>员工稳定在职自运转中</li>
            </ul>
        `
    },
    frame2: {
        name: '抖音',
        icon: '🎵',
        desc: '拒傲ao',
        content: `
            <div class="account-grid" style="grid-template-columns:1fr">
                <a href="https://www.douyin.com/user/MS4wLjABAAAA6Zyw3gR6Ox9Bs0SrHHehBm12Adb7_AIrwVAlueIG6NI" class="account-card" target="_blank" rel="noopener">
                    <img src="douyin-avatar.png" class="account-avatar-img" alt="拒傲ao">
                    <span class="account-name">拒傲ao</span>
                </a>
            </div>
            <div class="divider"></div>
            <p>👊看不惯的东西我想说就说！</p>
            <p>😄ENTP➕摩羯♑️</p>
            <p>🏫研二在读</p>
        `
    },
    whiteboard: {
        name: '白板',
        icon: '📝',
        desc: 'Zoey 的房间',
        content: `
            <h3>Welcome to Zoey's room~</h3>
            <div class="divider"></div>
            <p><strong>Recent to-dos:</strong></p>
            <p>1、A little bit of work and study</p>
            <p>2、Sleep, sleep, sleep, sleep</p>
            <p>3、Eat, eat, eat, eat</p>
        `
    },
    photoAlbum: {
        name: '生活相册',
        icon: '📷',
        desc: '记录日常点滴',
        content: `
            <div class="photo-gallery" style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-top:0.5rem">
                <img src="photo1.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo1.jpg')">
                <img src="photo2.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo2.jpg')">
                <img src="photo3.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo3.jpg')">
                <img src="photo4.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo4.jpg')">
                <img src="photo5.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo5.jpg')">
                <img src="photo6.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo6.jpg')">
                <img src="photo7.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo7.jpg')">
                <img src="photo8.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo8.jpg')">
                <img src="photo9.jpg" class="gallery-thumb" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;cursor:pointer" onclick="showPhotoLightbox('photo9.jpg')">
            </div>
            <div class="divider"></div>
            <p>点击照片可以放大查看。</p>
        `
    },
    feedback: {
        name: '心语盆栽',
        icon: '🪴',
        desc: '写下你的想法',
        content: `
            <h3>🪴 心语盆栽</h3>
            <p>在这盆绿植旁留下你的心声，每一句话都会像养分一样被珍视。</p>
            <p>无论是建议、鼓励还是闲聊，都欢迎告诉我。</p>
            <div class="divider"></div>
            <form id="feedback-form" style="display:flex;flex-direction:column;gap:0.8rem;margin-top:1rem">
                <input type="text" id="feedback-name" placeholder="你的名字（可选）" style="padding:0.6rem;border:1px solid rgba(0,0,0,0.1);border-radius:8px;font-size:0.85rem;background:rgba(255,255,255,0.5)">
                <textarea id="feedback-msg" rows="4" placeholder="写下你的留言..." style="padding:0.6rem;border:1px solid rgba(0,0,0,0.1);border-radius:8px;font-size:0.85rem;resize:vertical;background:rgba(255,255,255,0.5)"></textarea>
                <button type="submit" style="padding:0.6rem 1.2rem;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:0.9rem;font-weight:500;cursor:pointer">种下心声</button>
            </form>
        `
    },
};

// 预加载图片列表
const PRELOAD_IMAGES = [
    // 相册图片
    'photo1.jpg', 'photo2.jpg', 'photo3.jpg', 'photo4.jpg', 'photo5.jpg',
    'photo6.jpg', 'photo7.jpg', 'photo8.jpg', 'photo9.jpg',
    // 书籍封面
    'book1.png', 'book2.png', 'book3.png', 'book4.png', 'book5.png', 'book6.png', 'book7.png',
    // 头像
    'avatar1.png', 'avatar2.png', 'avatar3.png',
    // 其他图片
    'photo-wall.jpeg', 'medal1-image.jpeg',
    'xhs-logo-rgb.png', 'douyin-logo-rgb.png', 'douyin-avatar.png',
    'pillow-cover.jpeg'
];

// 预加载所有图片
function preloadImages(images) {
    return Promise.all(images.map(src => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = resolve; // 即使加载失败也继续
            img.src = src;
        });
    }));
}

function init() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(COLORS.wall);
        scene.fog = new THREE.Fog(COLORS.wall, 15, 35);

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
        // Chair will be created after desk to align properly
        createLaptop();
        createLamp();
        createCoffee();
        createPens();
        createChair();  // Create chair after desk so position is relative to desk
        createWallShelf();
        // createMusicCabinet(); // 已删除：吉他、网球、羽毛球
        createFrames();
        createWhiteboard();
        createPhotoAlbumWall();
        createFeedbackBox();
        createCarpet();

        setupEventListeners();
        createModal();
        initMusicPlayer();
        initEntryOverlay();

        // 预加载图片，完成后显示引导页
        preloadImages(PRELOAD_IMAGES).then(() => {
            document.getElementById('loading').classList.add('hidden');
            // 显示进入引导层
            const entryOverlay = document.getElementById('entry-overlay');
            if (entryOverlay) entryOverlay.classList.add('active');
        });

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
    ambientLight = new THREE.AmbientLight(0xfff8f0, 0.5);
    scene.add(ambientLight);

    mainLight = new THREE.DirectionalLight(0xfff8f0, 1.5);
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

    fillLight = new THREE.DirectionalLight(0xe8f0ff, 0.2);
    fillLight.position.set(-3, 5, 2);
    scene.add(fillLight);

    hemiLight = new THREE.HemisphereLight(0xfff8f0, 0xd5d0cc, 0.3);
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

    // 背景墙 - 大面积延伸
    const wallGeo = new THREE.PlaneGeometry(60, 20);
    const wallMat = new THREE.MeshStandardMaterial({
        color: COLORS.wall,
        roughness: 0.95,
        metalness: 0.0
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 10, -5.95);
    wall.receiveShadow = true;
    scene.add(wall);

    // 左延伸墙 - 与背景同色，消除左侧边界
    const leftWallGeo = new THREE.PlaneGeometry(40, 20);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-29.95, 10, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // 右延伸墙 - 与背景同色，消除右侧边界
    const rightWallGeo = new THREE.PlaneGeometry(40, 20);
    const rightWall = new THREE.Mesh(rightWallGeo, wallMat);
    rightWall.position.set(29.95, 10, 0);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
}

// ========================================
// 书桌
// ========================================
function createDesk() {
    const group = new THREE.Group();

    const topGeo = new THREE.BoxGeometry(3.2, 0.06, 1.6);
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
    const legPositions = [[-1.45, 0.75, 0.65], [1.45, 0.75, 0.65], [-1.45, 0.75, -0.65], [1.45, 0.75, -0.65]];
    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(...pos);
        leg.castShadow = true;
        group.add(leg);
    });

    // 左侧腿之间的连接木板
    const leftConnectGeo = new THREE.BoxGeometry(0.08, 0.04, 1.4);
    const leftConnect = new THREE.Mesh(leftConnectGeo, legMat);
    leftConnect.position.set(-1.45, 0.08, 0);
    leftConnect.castShadow = true;
    group.add(leftConnect);

    // 右侧腿之间的连接木板
    const rightConnectGeo = new THREE.BoxGeometry(0.08, 0.04, 1.4);
    const rightConnect = new THREE.Mesh(rightConnectGeo, legMat);
    rightConnect.position.set(1.45, 0.08, 0);
    rightConnect.castShadow = true;
    group.add(rightConnect);

    group.position.set(0, 0, -3.5);
    scene.add(group);
}

// ========================================
// 电竞椅 - 基于参考图精细还原（修正版）
// ========================================
function createChair() {
    const group = new THREE.Group();
    const cs = 0.75;  // 椅子整体缩小到75%
    // 注意：cs 变量当前未使用，如需缩放请在 group.scale 中设置

    const fabricMat = new THREE.MeshStandardMaterial({
        color: 0x4a4a52, roughness: 0.85, metalness: 0.0, side: THREE.DoubleSide
    });
    const fabricDarkMat = new THREE.MeshStandardMaterial({
        color: 0x3a3a42, roughness: 0.9, metalness: 0.0
    });
    const plasticMat = new THREE.MeshStandardMaterial({
        color: 0x33333a, roughness: 0.4, metalness: 0.1
    });
    const plasticLightMat = new THREE.MeshStandardMaterial({
        color: 0x3d3d45, roughness: 0.35, metalness: 0.15
    });
    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x2a2a30, roughness: 0.3, metalness: 0.6
    });
    const wheelMat = new THREE.MeshStandardMaterial({
        color: 0x25252a, roughness: 0.7, metalness: 0.2
    });

    // ========== 1. 坐垫（y=0.5~0.58） ==========
    const seatShape = new THREE.Shape();
    const sw = 0.55, sd = 0.52, sr = 0.12;
    seatShape.moveTo(-sw + sr, -sd);
    seatShape.lineTo(sw - sr, -sd);
    seatShape.quadraticCurveTo(sw, -sd, sw, -sd + sr);
    seatShape.lineTo(sw, sd - sr);
    seatShape.quadraticCurveTo(sw, sd, sw - sr, sd);
    seatShape.lineTo(-sw + sr, sd);
    seatShape.quadraticCurveTo(-sw, sd, -sw, sd - sr);
    seatShape.lineTo(-sw, -sd + sr);
    seatShape.quadraticCurveTo(-sw, -sd, -sw + sr, -sd);

    const seatGeo = new THREE.ExtrudeGeometry(seatShape, {
        steps: 2, depth: 0.12, bevelEnabled: true,
        bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 6
    });
    const seat = new THREE.Mesh(seatGeo, fabricMat);
    seat.rotation.x = -Math.PI / 2;
    seat.position.y = 0.70;
    seat.castShadow = true;
    group.add(seat);

    // 坐垫底部塑料板
    const seatBottom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32), plasticMat
    );
    seatBottom.position.y = 0.64;
    group.add(seatBottom);

    // ========== 2. 靠背（底部与坐垫后沿对齐） ==========
    const bw = 0.48, bh = 0.62, br = 0.1;
    const backShape = new THREE.Shape();
    backShape.moveTo(-bw + br, -bh);
    backShape.lineTo(bw - br, -bh);
    backShape.quadraticCurveTo(bw, -bh, bw, -bh + br);
    backShape.lineTo(bw, bh - br);
    backShape.quadraticCurveTo(bw, bh, bw - br, bh);
    backShape.lineTo(-bw + br, bh);
    backShape.quadraticCurveTo(-bw, bh, -bw, bh - br);
    backShape.lineTo(-bw, -bh + br);
    backShape.quadraticCurveTo(-bw, -bh, -bw + br, -bh);

    const backGeo = new THREE.ExtrudeGeometry(backShape, {
        steps: 2, depth: 0.08, bevelEnabled: true,
        bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 5
    });
    const backrest = new THREE.Mesh(backGeo, fabricMat);
    // 靠背底部中心在 (0, 0.54, -0.52)，与坐垫后沿平齐
    // ExtrudeGeometry 从 y=0 向 +y 挤出，需上移 bh 使底部对齐 y=0.54
    backrest.position.set(0, 0.70 + bh, -0.52);
    backrest.rotation.x = -0.08;
    backrest.castShadow = true;
    group.add(backrest);

    // 靠背连接支架（隐藏在坐垫和靠背之间）
    const bracket = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.12, 0.06), plasticMat
    );
    bracket.position.set(0, 0.68 + bh, -0.48);
    bracket.rotation.x = -0.08;
    group.add(bracket);

    // ========== 3. 扶手（从坐垫侧面向上到靠背侧面） ==========
    function createArmrest(side) {
        const armGroup = new THREE.Group();
        const xs = side * 0.60;

        // 垂直支撑 - 从坐垫侧面向上弯曲到扶手垫
        const supportCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(xs, 0.70, 0.0),
            new THREE.Vector3(xs, 0.78, 0.05),
            new THREE.Vector3(xs, 0.84, 0.10),
            new THREE.Vector3(xs, 0.88, 0.15)
        ]);
        const support = new THREE.Mesh(
            new THREE.TubeGeometry(supportCurve, 12, 0.022, 8, false),
            plasticMat
        );
        armGroup.add(support);

        // 扶手垫 - 圆角矩形，水平放置，前后延伸
        const padShape = new THREE.Shape();
        const pw = 0.10, pd = 0.30, pr = 0.03;
        padShape.moveTo(-pw + pr, -pd);
        padShape.lineTo(pw - pr, -pd);
        padShape.quadraticCurveTo(pw, -pd, pw, -pd + pr);
        padShape.lineTo(pw, pd - pr);
        padShape.quadraticCurveTo(pw, pd, pw - pr, pd);
        padShape.lineTo(-pw + pr, pd);
        padShape.quadraticCurveTo(-pw, pd, -pw, pd - pr);
        padShape.lineTo(-pw, -pd + pr);
        padShape.quadraticCurveTo(-pw, -pd, -pw + pr, -pd);

        const padGeo = new THREE.ExtrudeGeometry(padShape, {
            steps: 1, depth: 0.03, bevelEnabled: true,
            bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4
        });
        const pad = new THREE.Mesh(padGeo, plasticLightMat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(xs, 0.90, 0.10);
        pad.castShadow = true;
        armGroup.add(pad);

        return armGroup;
    }
    group.add(createArmrest(-1));
    group.add(createArmrest(1));

    // ========== 4. 气压杆（连接坐垫底部 y=0.48 到 hub 顶部 y=0.15） ==========
    const cylTop = 0.64;
    const cylBot = 0.15;
    const cylHeight = cylTop - cylBot;  // 0.33
    const cylCenter = (cylTop + cylBot) / 2;  // 0.315

    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, cylHeight, 16), metalMat
    );
    cylinder.position.y = cylCenter;
    group.add(cylinder);

    // 气压杆外套（比气压杆短，套在下半段）
    const coverTop = 0.56;
    const coverBot = 0.17;
    const coverHeight = coverTop - coverBot;  // 0.23
    const coverCenter = (coverTop + coverBot) / 2;  // 0.285
    const cover = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.055, coverHeight, 16), plasticMat
    );
    cover.position.y = coverCenter;
    group.add(cover);

    // 调节杆（从坐垫底部右侧伸出）
    const lever = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), plasticMat
    );
    lever.position.set(0.15, 0.60, 0.10);
    lever.rotation.z = Math.PI / 2;
    lever.rotation.y = Math.PI / 4;
    group.add(lever);

    const leverKnob = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8), plasticMat
    );
    leverKnob.position.set(0.21, 0.60, 0.15);
    group.add(leverKnob);

    // ========== 5. 五星底座 ==========
    const baseGroup = new THREE.Group();

    // Hub — 加高，顶部 y=0.15 与气压杆底部对接
    const hubHeight = 0.10;
    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.075, hubHeight, 16), plasticMat
    );
    hub.position.y = 0.10;  // 中心 y=0.10，范围 0.05~0.15
    baseGroup.add(hub);

    // Hub 顶部盖（连接气压杆）
    const hubCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.052, 0.06, 0.025, 16), plasticMat
    );
    hubCap.position.y = 0.163;  // 覆盖 hub 与 cylinder 交界处
    baseGroup.add(hubCap);

    // 五条支腿：从 hub（y=0.10）向外向下倾斜到滚轮（y=0.02）
    const legHubY = 0.10;    // 腿起点高度（hub 中心）
    const legWheelY = 0.025;  // 腿终点高度（滚轮中心）
    const legWheelDist = 0.34; // 滚轮距中心的水平距离
    const legDy = legHubY - legWheelY;   // 0.075（hub 比滚轮高）
    const legDz = legWheelDist;          // 0.34
    const legLen = Math.sqrt(legDy * legDy + legDz * legDz);  // ≈ 0.348
    const legTilt = Math.atan2(legDy, legDz);  // ≈ +0.217 rad（约 +12.5°，远端向下倾斜到滚轮）

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const legGroup = new THREE.Group();
        legGroup.rotation.y = angle;

        // 支腿（倾斜的方管，从 hub 延伸到滚轮位置）
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.048, 0.038, legLen), plasticMat
        );
        // 定位到 hub 和滚轮的中点
        leg.position.set(0, (legHubY + legWheelY) / 2, legDz / 2);
        leg.rotation.x = legTilt;  // 向下倾斜
        legGroup.add(leg);

        // 腿端接头（连接滚轮）
        const tip = new THREE.Mesh(
            new THREE.BoxGeometry(0.055, 0.04, 0.05), plasticMat
        );
        tip.position.set(0, legWheelY, legWheelDist);
        legGroup.add(tip);

        baseGroup.add(legGroup);

        // 滚轮（直接放在 baseGroup 中，用绝对坐标）
        const wheelGroup = new THREE.Group();

        // 轮子外壳（叉子顶部）
        const housing = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.035, 0.04), wheelMat
        );
        housing.position.y = 0.04;
        wheelGroup.add(housing);

        // 叉子（连接外壳和轮子）
        const fork = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 0.05, 0.025), wheelMat
        );
        fork.position.y = 0.018;
        wheelGroup.add(fork);

        // 轮子（中心 y=0.01 相对 wheelGroup，即绝对 y=0.035，底部接地）
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16), wheelMat
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.y = 0.01;
        wheelGroup.add(wheel);

        // 轮子外圈
        const rim = new THREE.Mesh(
            new THREE.TorusGeometry(0.022, 0.004, 6, 12),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.5, metalness: 0.3 })
        );
        rim.rotation.y = Math.PI / 2;
        rim.position.y = 0.01;
        wheelGroup.add(rim);

        // 定位滚轮到腿端
        wheelGroup.position.set(
            Math.sin(angle) * legWheelDist,
            legWheelY,
            Math.cos(angle) * legWheelDist
        );
        baseGroup.add(wheelGroup);
    }
    group.add(baseGroup);

    // ========== 6. 缝线细节 ==========
    const edgeRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.52, 0.008, 8, 48), fabricDarkMat
    );
    edgeRing.rotation.x = Math.PI / 2;
    edgeRing.position.y = 0.715;
    edgeRing.scale.set(1.05, 1, 0.95);
    group.add(edgeRing);

    // 场景中的位置和旋转 — 桌子正中间
    group.scale.set(0.8, 0.8, 0.8);
    group.position.set(0, 0, -2.0);
    group.rotation.y = Math.PI + Math.PI / 4;
    group.userData = { name: 'chair', displayName: '关于我' };
    scene.add(group);
    roomObjects.chair = group;
}

// ========================================
// 笔记本电脑
// ========================================
function createLaptop() {
    const group = new THREE.Group();
    const scale = 0.65;

    // 苹果风格：银灰色铝合金机身
    const aluminumMat = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.25,
        metalness: 0.85
    });

    // 底部机身 - 圆角矩形风格
    const baseGeo = new THREE.BoxGeometry(1.1 * scale, 0.025 * scale, 0.75 * scale);
    const base = new THREE.Mesh(baseGeo, aluminumMat);
    base.castShadow = true;
    group.add(base);

    // 底部橡胶脚垫（4个）
    const footGeo = new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, 0.008 * scale, 8);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
    const footPositions = [
        [-0.45 * scale, -0.016 * scale, -0.3 * scale],
        [0.45 * scale, -0.016 * scale, -0.3 * scale],
        [-0.45 * scale, -0.016 * scale, 0.3 * scale],
        [0.45 * scale, -0.016 * scale, 0.3 * scale]
    ];
    footPositions.forEach(pos => {
        const foot = new THREE.Mesh(footGeo, footMat);
        foot.position.set(...pos);
        group.add(foot);
    });

    // 上盖外壳 - 银灰色
    const lidGeo = new THREE.BoxGeometry(1.1 * scale, 0.75 * scale, 0.02 * scale);
    const lid = new THREE.Mesh(lidGeo, aluminumMat);
    lid.position.set(0, 0.375 * scale, -0.375 * scale);
    lid.rotation.x = -0.18;
    lid.castShadow = true;
    group.add(lid);

    // 屏幕边框 - 黑色窄边框
    const bezelGeo = new THREE.BoxGeometry(1.05 * scale, 0.7 * scale, 0.005 * scale);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(0, 0.375 * scale, -0.365 * scale);
    bezel.rotation.x = -0.18;
    group.add(bezel);

    // 屏幕显示区域 - 深色发光效果
    const screenGeo = new THREE.BoxGeometry(0.98 * scale, 0.62 * scale, 0.003 * scale);
    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a2e,
        roughness: 0.1,
        emissive: 0x0a0a1a,
        emissiveIntensity: 0.3
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 0.375 * scale, -0.363 * scale);
    screen.rotation.x = -0.18;
    group.add(screen);

    // 键盘区域 - 黑色
    const kbGeo = new THREE.BoxGeometry(0.9 * scale, 0.005 * scale, 0.5 * scale);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.3 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(0, 0.03 * scale, 0.04 * scale);
    group.add(kb);

    // 触控板 - 银色金属质感（增加厚度避免闪烁）
    const trackGeo = new THREE.BoxGeometry(0.3 * scale, 0.015 * scale, 0.2 * scale);
    const trackMat = new THREE.MeshStandardMaterial({
        color: 0xb8b8b8,
        roughness: 0.2,
        metalness: 0.7
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0.035 * scale, 0.26 * scale);
    group.add(track);

    // 转轴 - 银色圆柱
    const hingeGeo = new THREE.CylinderGeometry(0.008 * scale, 0.008 * scale, 1.08 * scale, 8);
    const hinge = new THREE.Mesh(hingeGeo, aluminumMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.012 * scale, -0.375 * scale);
    group.add(hinge);

    group.position.set(0.2, 1.53, -3.35);
    group.userData = { name: 'laptop', displayName: '实习及创业经历' };
    scene.add(group);
    roomObjects.laptop = group;
}

// ========================================
// 台灯 - 银色高级极简设计，支持三种光源切换
// ========================================
function createLamp() {
    const group = new THREE.Group();

    // 银色金属材质 - 高级质感
    const silverMat = new THREE.MeshStandardMaterial({
        color: 0xc8c8c8,
        roughness: 0.15,
        metalness: 0.9
    });

    // 深银灰色材质 - 关节和细节
    const darkSilverMat = new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.2,
        metalness: 0.85
    });

    // 白色灯罩材质
    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xf0f0f0,
        roughness: 0.3,
        metalness: 0.1
    });

    // 发光面板材质
    const emitMat = new THREE.MeshStandardMaterial({
        color: 0xfff8e7,
        emissive: 0xfff8e7,
        emissiveIntensity: 0.8
    });

    const s = 1.5;

    // ===== 底座 =====
    // 主底座 - 扁平圆盘
    const baseGeo = new THREE.CylinderGeometry(0.11 * s, 0.11 * s, 0.018 * s, 48);
    const base = new THREE.Mesh(baseGeo, whiteMat);
    base.castShadow = true;
    group.add(base);

    // 底座底部深色环
    const baseRingGeo = new THREE.CylinderGeometry(0.105 * s, 0.11 * s, 0.008 * s, 48);
    const baseRing = new THREE.Mesh(baseRingGeo, darkSilverMat);
    baseRing.position.y = -0.013 * s;
    group.add(baseRing);

    // ===== 下关节 =====
    const lowerJointGeo = new THREE.CylinderGeometry(0.025 * s, 0.025 * s, 0.035 * s, 24);
    const lowerJoint = new THREE.Mesh(lowerJointGeo, darkSilverMat);
    lowerJoint.position.y = 0.025 * s;
    group.add(lowerJoint);

    // 关节装饰环
    const jointRingGeo = new THREE.TorusGeometry(0.026 * s, 0.004 * s, 12, 24);
    const jointRing = new THREE.Mesh(jointRingGeo, silverMat);
    jointRing.position.y = 0.025 * s;
    jointRing.rotation.x = Math.PI / 2;
    group.add(jointRing);

    // ===== 下臂 =====
    const lowerArmGeo = new THREE.BoxGeometry(0.022 * s, 0.32 * s, 0.012 * s);
    const lowerArm = new THREE.Mesh(lowerArmGeo, silverMat);
    lowerArm.position.set(0, 0.19 * s, 0);
    lowerArm.castShadow = true;
    group.add(lowerArm);

    // ===== 上关节 =====
    const upperJointGeo = new THREE.CylinderGeometry(0.022 * s, 0.022 * s, 0.03 * s, 24);
    const upperJoint = new THREE.Mesh(upperJointGeo, darkSilverMat);
    upperJoint.position.set(0, 0.35 * s, 0);
    group.add(upperJoint);

    // 上关节装饰环
    const upperJointRingGeo = new THREE.TorusGeometry(0.023 * s, 0.003 * s, 12, 24);
    const upperJointRing = new THREE.Mesh(upperJointRingGeo, silverMat);
    upperJointRing.position.set(0, 0.35 * s, 0);
    upperJointRing.rotation.x = Math.PI / 2;
    group.add(upperJointRing);

    // ===== 上臂 =====
    const upperArmGeo = new THREE.BoxGeometry(0.018 * s, 0.28 * s, 0.01 * s);
    const upperArm = new THREE.Mesh(upperArmGeo, silverMat);
    upperArm.position.set(0.08 * s, 0.46 * s, 0);
    upperArm.rotation.z = -0.55;
    upperArm.castShadow = true;
    group.add(upperArm);

    // ===== 灯头连接 =====
    const headConnectorGeo = new THREE.CylinderGeometry(0.018 * s, 0.018 * s, 0.025 * s, 24);
    const headConnector = new THREE.Mesh(headConnectorGeo, darkSilverMat);
    headConnector.position.set(0.15 * s, 0.52 * s, 0);
    headConnector.rotation.z = 0.55;
    group.add(headConnector);

    // ===== 灯罩 =====
    // 灯罩外壳 - 圆柱形
    const shadeOuterGeo = new THREE.CylinderGeometry(0.065 * s, 0.065 * s, 0.045 * s, 48);
    const shadeOuter = new THREE.Mesh(shadeOuterGeo, whiteMat);
    shadeOuter.position.set(0.17 * s, 0.5 * s, 0);
    shadeOuter.rotation.z = 0.35;
    shadeOuter.castShadow = true;
    group.add(shadeOuter);

    // 灯罩顶部盖
    const shadeTopGeo = new THREE.CylinderGeometry(0.065 * s, 0.065 * s, 0.005 * s, 48);
    const shadeTop = new THREE.Mesh(shadeTopGeo, whiteMat);
    shadeTop.position.set(0.17 * s, 0.523 * s, 0);
    shadeTop.rotation.z = 0.35;
    group.add(shadeTop);

    // 发光面板
    const lightPanelGeo = new THREE.CylinderGeometry(0.058 * s, 0.058 * s, 0.003 * s, 48);
    const lightPanel = new THREE.Mesh(lightPanelGeo, emitMat);
    lightPanel.position.set(0.17 * s, 0.477 * s, 0);
    lightPanel.rotation.z = 0.35;
    group.add(lightPanel);

    // ===== 光源 =====
    lampLight = new THREE.PointLight(0xfff0d0, 1.2, 6);
    lampLight.position.set(0.17 * s, 0.47 * s, 0);
    group.add(lampLight);

    group.position.set(-0.9, 1.53, -3.6);
    group.userData = { name: 'lamp', displayName: '台灯' };
    scene.add(group);
    roomObjects.lamp = group;
}

// ========================================
// 瑞幸咖啡杯
// ========================================
function createCoffee() {
    const group = new THREE.Group();

    // 瑞幸蓝
    const luckinBlue = 0x0022ab;
    const luckinLightBlue = 0x1a4fd1;

    const cs = 1.3;  // 咖啡杯放大1.3倍

    // 杯身 - 瑞幸经典蓝纸杯
    const cupGeo = new THREE.CylinderGeometry(0.055 * cs, 0.048 * cs, 0.12 * cs, 24);
    const cupMat = new THREE.MeshStandardMaterial({ color: luckinBlue, roughness: 0.7, metalness: 0.0 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.position.y = 0.06 * cs;
    cup.castShadow = true;
    group.add(cup);

    // 杯口白色边缘
    const rimGeo = new THREE.CylinderGeometry(0.057 * cs, 0.055 * cs, 0.015 * cs, 24);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.127 * cs;
    group.add(rim);

    // 杯盖 - 白色塑料拱盖
    const lidGeo = new THREE.SphereGeometry(0.058 * cs, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.35);
    const lidMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.4, metalness: 0.05 });
    const lid = new THREE.Mesh(lidGeo, lidMat);
    lid.position.y = 0.135 * cs;
    group.add(lid);

    // 瑞幸鹿头 logo - 简化白色圆形标
    const logoGeo = new THREE.CircleGeometry(0.022 * cs, 24);
    const logoMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.position.set(0, 0.07 * cs, 0.056 * cs);
    group.add(logo);

    // logo 内蓝色鹿头轮廓（简化小圆）
    const logoInnerGeo = new THREE.CircleGeometry(0.014 * cs, 24);
    const logoInnerMat = new THREE.MeshStandardMaterial({ color: luckinBlue, roughness: 0.5 });
    const logoInner = new THREE.Mesh(logoInnerGeo, logoInnerMat);
    logoInner.position.set(0, 0.07 * cs, 0.057 * cs);
    group.add(logoInner);

    // 杯套 - 浅蓝色隔热环
    const sleeveGeo = new THREE.CylinderGeometry(0.056 * cs, 0.056 * cs, 0.045 * cs, 24);
    const sleeveMat = new THREE.MeshStandardMaterial({ color: luckinLightBlue, roughness: 0.8 });
    const sleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeve.position.y = 0.05 * cs;
    group.add(sleeve);

    // 吸管 - 白色细管
    const strawGeo = new THREE.CylinderGeometry(0.003 * cs, 0.003 * cs, 0.08 * cs, 8);
    const strawMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const straw = new THREE.Mesh(strawGeo, strawMat);
    straw.position.set(0.02 * cs, 0.16 * cs, 0);
    straw.rotation.z = 0.1;
    group.add(straw);

    // 咖啡杯放在电脑右侧偏后
    group.position.set(1.15, 1.53, -3.65);
    group.userData = { name: 'coffee', displayName: '联系方式' };
    scene.add(group);
    roomObjects.coffee = group;
}

// ========================================
// 钢笔 - 两只放在电脑右侧
// ========================================
function createPens() {
    const group = new THREE.Group();

    const penBodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.7 });
    const penCapMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.2, metalness: 0.8 });
    const penTipMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.3, metalness: 0.9 });
    const penGoldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.8 });

    function createPen(x, z, rotationY) {
        const penGroup = new THREE.Group();

        // 笔身 - 细长圆柱
        const bodyGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.18, 12);
        const body = new THREE.Mesh(bodyGeo, penBodyMat);
        body.position.y = 0.09;
        penGroup.add(body);

        // 笔帽
        const capGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.06, 12);
        const cap = new THREE.Mesh(capGeo, penCapMat);
        cap.position.y = 0.18;
        penGroup.add(cap);

        // 笔帽金环
        const ringGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.008, 12);
        const ring = new THREE.Mesh(ringGeo, penGoldMat);
        ring.position.y = 0.15;
        penGroup.add(ring);

        // 笔尖
        const tipGeo = new THREE.ConeGeometry(0.008, 0.025, 12);
        const tip = new THREE.Mesh(tipGeo, penTipMat);
        tip.position.y = -0.012;
        penGroup.add(tip);

        // 笔夹
        const clipGeo = new THREE.BoxGeometry(0.003, 0.04, 0.012);
        const clip = new THREE.Mesh(clipGeo, penGoldMat);
        clip.position.set(0.014, 0.17, 0);
        penGroup.add(clip);

        penGroup.position.set(x, 1.53, z);
        penGroup.rotation.y = rotationY;
        penGroup.rotation.z = Math.PI / 2; // 横放
        penGroup.rotation.x = 0.05; // 轻微倾斜
        return penGroup;
    }

    // 两只钢笔，电脑右侧，一前一后略有角度
    group.add(createPen(0.75, -3.3, 0.3));
    group.add(createPen(0.78, -3.45, -0.2));

    group.userData = { name: 'pens', displayName: '钢笔' };
    scene.add(group);
    roomObjects.pens = group;
}

// ========================================
// 相机（已停用，保留代码备用）
// ========================================
function createCamera() {
    const group = new THREE.Group();

    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.6 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
    const pinkMat = new THREE.MeshStandardMaterial({ color: 0xffb6c1, roughness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });

    // 身体 - 椭球形
    const bodyGeo = new THREE.SphereGeometry(0.14, 32, 16);
    bodyGeo.scale(1.1, 0.9, 0.85);
    const body = new THREE.Mesh(bodyGeo, orangeMat);
    body.position.y = 0.12;
    body.castShadow = true;
    group.add(body);

    // 肚子 - 白色椭圆
    const bellyGeo = new THREE.SphereGeometry(0.09, 32, 16);
    bellyGeo.scale(1, 0.85, 0.6);
    const belly = new THREE.Mesh(bellyGeo, whiteMat);
    belly.position.set(0, 0.08, 0.07);
    group.add(belly);

    // 头部
    const headGeo = new THREE.SphereGeometry(0.11, 32, 16);
    const head = new THREE.Mesh(headGeo, orangeMat);
    head.position.set(0, 0.3, 0.04);
    head.castShadow = true;
    group.add(head);

    // 左耳
    const earGeo = new THREE.ConeGeometry(0.04, 0.08, 16);
    const leftEar = new THREE.Mesh(earGeo, orangeMat);
    leftEar.position.set(-0.07, 0.4, 0.04);
    leftEar.rotation.z = 0.3;
    group.add(leftEar);

    // 右耳
    const rightEar = new THREE.Mesh(earGeo, orangeMat);
    rightEar.position.set(0.07, 0.4, 0.04);
    rightEar.rotation.z = -0.3;
    group.add(rightEar);

    // 左耳内侧 - 粉色
    const earInnerGeo = new THREE.ConeGeometry(0.025, 0.05, 16);
    const leftEarInner = new THREE.Mesh(earInnerGeo, pinkMat);
    leftEarInner.position.set(-0.07, 0.39, 0.06);
    leftEarInner.rotation.z = 0.3;
    group.add(leftEarInner);

    // 右耳内侧 - 粉色
    const rightEarInner = new THREE.Mesh(earInnerGeo, pinkMat);
    rightEarInner.position.set(0.07, 0.39, 0.06);
    rightEarInner.rotation.z = -0.3;
    group.add(rightEarInner);

    // 左眼
    const eyeGeo = new THREE.SphereGeometry(0.018, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeo, blackMat);
    leftEye.position.set(-0.04, 0.32, 0.13);
    group.add(leftEye);

    // 右眼
    const rightEye = new THREE.Mesh(eyeGeo, blackMat);
    rightEye.position.set(0.04, 0.32, 0.13);
    group.add(rightEye);

    // 左眼高光
    const highlightGeo = new THREE.SphereGeometry(0.006, 8, 8);
    const leftHighlight = new THREE.Mesh(highlightGeo, whiteMat);
    leftHighlight.position.set(-0.035, 0.325, 0.145);
    group.add(leftHighlight);

    // 右眼高光
    const rightHighlight = new THREE.Mesh(highlightGeo, whiteMat);
    rightHighlight.position.set(0.045, 0.325, 0.145);
    group.add(rightHighlight);

    // 鼻子
    const noseGeo = new THREE.SphereGeometry(0.012, 16, 16);
    const nose = new THREE.Mesh(noseGeo, pinkMat);
    nose.position.set(0, 0.28, 0.14);
    group.add(nose);

    // 尾巴
    const tailGeo = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.1, -0.1),
            new THREE.Vector3(0.05, 0.18, -0.14),
            new THREE.Vector3(0.08, 0.22, -0.12),
        ]),
        12, 0.025, 8, false
    );
    const tail = new THREE.Mesh(tailGeo, orangeMat);
    group.add(tail);

    // 左前爪
    const pawGeo = new THREE.SphereGeometry(0.035, 16, 16);
    pawGeo.scale(1, 0.7, 1.2);
    const leftPaw = new THREE.Mesh(pawGeo, whiteMat);
    leftPaw.position.set(-0.06, 0.02, 0.1);
    group.add(leftPaw);

    // 右前爪
    const rightPaw = new THREE.Mesh(pawGeo, whiteMat);
    rightPaw.position.set(0.06, 0.02, 0.1);
    group.add(rightPaw);

    group.position.set(1.6, 1.53, -3.5);
    group.rotation.y = -0.3;
    group.userData = { name: 'camera', displayName: '我的猫咪' };
    scene.add(group);
    roomObjects.camera = group;
}

// ========================================
// 立式书架 - 紧靠书桌右侧
// ========================================
function createWallShelf() {
    const group = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.7 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.8 });

    // 书架外框 - 有厚度的真实框架
    const frameThick = 0.05;
    const shelfW = 1.5, shelfH = 3.4, shelfD = 0.45;

    // 左侧板
    const leftPanel = new THREE.Mesh(new THREE.BoxGeometry(frameThick, shelfH, shelfD), woodMat);
    leftPanel.position.set(-shelfW / 2 + frameThick / 2, shelfH / 2, 0);
    leftPanel.castShadow = true;
    group.add(leftPanel);

    // 右侧板
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(frameThick, shelfH, shelfD), woodMat);
    rightPanel.position.set(shelfW / 2 - frameThick / 2, shelfH / 2, 0);
    rightPanel.castShadow = true;
    group.add(rightPanel);

    // 顶板
    const topPanel = new THREE.Mesh(new THREE.BoxGeometry(shelfW, frameThick, shelfD), woodMat);
    topPanel.position.set(0, shelfH - frameThick / 2, 0);
    topPanel.castShadow = true;
    group.add(topPanel);

    // 背板
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(shelfW, shelfH, 0.015), darkWoodMat);
    backPanel.position.set(0, shelfH / 2, -shelfD / 2 + 0.008);
    group.add(backPanel);

    // 隔板（4层）
    const shelfLevels = [0.68, 1.36, 2.04, 2.72];
    shelfLevels.forEach(y => {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(shelfW - frameThick * 2, 0.025, shelfD - 0.02),
            woodMat
        );
        shelf.position.set(0, y, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        group.add(shelf);
    });

    // 书籍材质 - 更真实的书脊效果
    const bookColors = [
        0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad,
        0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f, 0x9b59b6,
        0xd35400, 0x1abc9c, 0x16a085, 0xe67e22, 0x2c3e50,
        0x7f8c8d, 0x34495e, 0x95a5a6
    ];

    // 每层放书
    shelfLevels.forEach((y, row) => {
        let xPos = -shelfW / 2 + frameThick + 0.02;
        const zBase = -shelfD / 2 + 0.06;

        // 随机决定这一排放多少本
        const bookCount = 8 + Math.floor(Math.random() * 6);

        for (let b = 0; b < bookCount; b++) {
            const h = 0.28 + Math.random() * 0.14;
            const w = 0.03 + Math.random() * 0.035;
            const d = 0.22 + Math.random() * 0.06;

            if (xPos + w > shelfW / 2 - frameThick - 0.02) break;

            // 每本书单独一个 Group
            const bookGroup = new THREE.Group();
            const bookX = xPos + w / 2;
            const bookY = y + 0.012 + h / 2;
            bookGroup.position.set(bookX, bookY, 0);

            // 书页（白色侧面）
            const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.9 });
            const pagesGeo = new THREE.BoxGeometry(w - 0.003, h - 0.01, d - 0.008);
            const pages = new THREE.Mesh(pagesGeo, pagesMat);
            pages.position.set(0, 0, 0);
            pages.castShadow = true;
            bookGroup.add(pages);

            // 书脊（朝外，紧贴书页前面）
            const spineColor = bookColors[Math.floor(Math.random() * bookColors.length)];
            const spineMat = new THREE.MeshStandardMaterial({ color: spineColor, roughness: 0.7 });
            const spineGeo = new THREE.BoxGeometry(w, h, 0.008);
            const spine = new THREE.Mesh(spineGeo, spineMat);
            spine.position.set(0, 0, (d - 0.008) / 2 + 0.004);
            spine.castShadow = true;
            bookGroup.add(spine);

            // 偶尔倾斜一本书
            if (Math.random() < 0.15 && b < bookCount - 1) {
                bookGroup.rotation.z = 0.08;
                bookGroup.position.x += 0.01;
            }

            group.add(bookGroup);
            xPos += w + 0.005 + Math.random() * 0.008;
        }
    });

    // 书架放在椅子旁边（右侧偏后），朝向左边
    // 宽度1.5从桌子下沿(y=1.5)到地毯下沿(y=0)，高度3.4从地面到白板上沿
    group.position.set(2.2, 0, -1.5);
    group.rotation.y = -Math.PI / 2;
    group.userData = { name: 'bookshelf', displayName: '教育背景' };
    scene.add(group);
    roomObjects.bookshelf = group;
}

// ========================================
// 音乐矮柜
// ========================================
function createMusicCabinet() {
    const group = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: 0xc4956a, roughness: 0.6 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.5 });
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.6, roughness: 0.3 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4 });
    const racketMat = new THREE.MeshStandardMaterial({ color: 0xe8e0d8, roughness: 0.5 });
    const netMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.8, transparent: true, opacity: 0.7 });

    // ========== 吉他 ==========
    const guitarGroup = new THREE.Group();

    // 吉他琴身 - 用两个相交的椭球模拟
    const bodyGeo1 = new THREE.SphereGeometry(0.22, 32, 16);
    bodyGeo1.scale(1, 0.75, 0.35);
    const body1 = new THREE.Mesh(bodyGeo1, woodMat);
    body1.castShadow = true;
    guitarGroup.add(body1);

    const bodyGeo2 = new THREE.SphereGeometry(0.16, 32, 16);
    bodyGeo2.scale(1, 0.85, 0.35);
    const body2 = new THREE.Mesh(bodyGeo2, woodMat);
    body2.position.set(0, 0.28, 0);
    body2.castShadow = true;
    guitarGroup.add(body2);

    // 音孔
    const soundHoleGeo = new THREE.CircleGeometry(0.065, 32);
    const soundHoleMat = new THREE.MeshBasicMaterial({ color: 0x1a0a05 });
    const soundHole = new THREE.Mesh(soundHoleGeo, soundHoleMat);
    soundHole.position.set(0, 0.18, 0.08);
    guitarGroup.add(soundHole);

    // 琴颈
    const neckGeo = new THREE.BoxGeometry(0.055, 0.55, 0.025);
    const neck = new THREE.Mesh(neckGeo, darkWoodMat);
    neck.position.set(0, 0.65, 0.02);
    neck.castShadow = true;
    guitarGroup.add(neck);

    // 指板
    const fretboardGeo = new THREE.BoxGeometry(0.05, 0.52, 0.008);
    const fretboard = new THREE.Mesh(fretboardGeo, darkWoodMat);
    fretboard.position.set(0, 0.65, 0.04);
    guitarGroup.add(fretboard);

    // 琴头
    const headGeo = new THREE.BoxGeometry(0.08, 0.12, 0.03);
    const head = new THREE.Mesh(headGeo, woodMat);
    head.position.set(0, 0.98, 0.03);
    guitarGroup.add(head);

    // 琴弦（6根）
    for (let i = 0; i < 6; i++) {
        const stringGeo = new THREE.CylinderGeometry(0.001 + i * 0.0003, 0.001 + i * 0.0003, 0.82, 6);
        const stringMesh = new THREE.Mesh(stringGeo, stringMat);
        stringMesh.position.set(-0.02 + i * 0.008, 0.62, 0.055);
        guitarGroup.add(stringMesh);
    }

    // 琴桥
    const bridgeGeo = new THREE.BoxGeometry(0.12, 0.015, 0.015);
    const bridge = new THREE.Mesh(bridgeGeo, darkWoodMat);
    bridge.position.set(0, 0.02, 0.07);
    guitarGroup.add(bridge);

    guitarGroup.position.set(-0.3, 0.22, 0.1);
    guitarGroup.rotation.z = -0.15;
    guitarGroup.rotation.y = 0.3;
    group.add(guitarGroup);

    // ========== 网球拍 ==========
    const tennisGroup = new THREE.Group();

    // 拍框 - 椭圆环
    const tennisFrameGeo = new THREE.TorusGeometry(0.14, 0.012, 12, 32);
    const tennisFrame = new THREE.Mesh(tennisFrameGeo, gripMat);
    tennisFrame.scale.set(1, 1.25, 1);
    tennisFrame.castShadow = true;
    tennisGroup.add(tennisFrame);

    // 拍网 - 用细线网格模拟
    for (let i = -3; i <= 3; i++) {
        const vLineGeo = new THREE.BoxGeometry(0.002, 0.26, 0.002);
        const vLine = new THREE.Mesh(vLineGeo, netMat);
        vLine.position.set(i * 0.035, 0, 0);
        tennisGroup.add(vLine);
    }
    for (let i = -4; i <= 4; i++) {
        const hLineGeo = new THREE.BoxGeometry(0.22, 0.002, 0.002);
        const hLine = new THREE.Mesh(hLineGeo, netMat);
        hLine.position.set(0, i * 0.03, 0);
        tennisGroup.add(hLine);
    }

    // 手柄
    const tennisHandleGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.22, 12);
    const tennisHandle = new THREE.Mesh(tennisHandleGeo, gripMat);
    tennisHandle.position.set(0, -0.22, 0);
    tennisHandle.castShadow = true;
    tennisGroup.add(tennisHandle);

    // 握把胶
    const tennisGripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 12);
    const tennisGrip = new THREE.Mesh(tennisGripGeo, new THREE.MeshStandardMaterial({ color: 0xcc3333, roughness: 0.7 }));
    tennisGrip.position.set(0, -0.28, 0);
    tennisGroup.add(tennisGrip);

    tennisGroup.position.set(0.25, 0.38, -0.05);
    tennisGroup.rotation.z = 0.25;
    tennisGroup.rotation.x = 0.1;
    group.add(tennisGroup);

    // ========== 羽毛球拍 ==========
    const badmintonGroup = new THREE.Group();

    // 拍框 - 更扁的椭圆
    const badFrameGeo = new THREE.TorusGeometry(0.11, 0.01, 12, 32);
    const badFrame = new THREE.Mesh(badFrameGeo, gripMat);
    badFrame.scale.set(1, 1.15, 1);
    badFrame.castShadow = true;
    badmintonGroup.add(badFrame);

    // 拍网
    for (let i = -3; i <= 3; i++) {
        const vLineGeo = new THREE.BoxGeometry(0.0015, 0.2, 0.0015);
        const vLine = new THREE.Mesh(vLineGeo, netMat);
        vLine.position.set(i * 0.028, 0, 0);
        badmintonGroup.add(vLine);
    }
    for (let i = -3; i <= 3; i++) {
        const hLineGeo = new THREE.BoxGeometry(0.18, 0.0015, 0.0015);
        const hLine = new THREE.Mesh(hLineGeo, netMat);
        hLine.position.set(0, i * 0.028, 0);
        badmintonGroup.add(hLine);
    }

    // 手柄
    const badHandleGeo = new THREE.CylinderGeometry(0.014, 0.018, 0.2, 12);
    const badHandle = new THREE.Mesh(badHandleGeo, gripMat);
    badHandle.position.set(0, -0.2, 0);
    badHandle.castShadow = true;
    badmintonGroup.add(badHandle);

    // 握把胶
    const badGripGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.1, 12);
    const badGrip = new THREE.Mesh(badGripGeo, new THREE.MeshStandardMaterial({ color: 0x3366cc, roughness: 0.7 }));
    badGrip.position.set(0, -0.24, 0);
    badmintonGroup.add(badGrip);

    badmintonGroup.position.set(0.45, 0.32, 0.15);
    badmintonGroup.rotation.z = -0.35;
    badmintonGroup.rotation.y = -0.2;
    group.add(badmintonGroup);

    group.position.set(-2.4, 0, -3.5);
    group.userData = { name: 'musicStand', displayName: '运动 & 音乐' };
    scene.add(group);
    roomObjects.musicStand = group;
}

// ========================================
// 相框
// ========================================
function createFrames() {
    const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.black, roughness: 0.3, metalness: 0.4 });
    const grayFrameMat = new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.4, metalness: 0.3 });
    const woodFrameMat = new THREE.MeshStandardMaterial({ color: 0x8b6f47, roughness: 0.5, metalness: 0.1 });
    const textureLoader = new THREE.TextureLoader();

    // 创建真实相框的辅助函数
    function createRealFrame(logoTexture, width, height, frameThickness, frameDepth) {
        const group = new THREE.Group();

        // 外框 - 四条木边框
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth),
            woodFrameMat
        );
        topFrame.position.set(0, height / 2 + frameThickness / 2, 0);
        topFrame.castShadow = true;
        group.add(topFrame);

        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth),
            woodFrameMat
        );
        bottomFrame.position.set(0, -height / 2 - frameThickness / 2, 0);
        bottomFrame.castShadow = true;
        group.add(bottomFrame);

        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth),
            woodFrameMat
        );
        leftFrame.position.set(-width / 2 - frameThickness / 2, 0, 0);
        leftFrame.castShadow = true;
        group.add(leftFrame);

        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth),
            woodFrameMat
        );
        rightFrame.position.set(width / 2 + frameThickness / 2, 0, 0);
        rightFrame.castShadow = true;
        group.add(rightFrame);

        // 内衬 - 白色卡纸边距
        const matBoardMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.8 });
        const matBoard = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, frameDepth * 0.6),
            matBoardMat
        );
        matBoard.position.z = frameDepth * 0.2;
        group.add(matBoard);

        // logo图片 - 使用PlaneGeometry，正面默认朝向Z轴正方向
        const logoW = width * 0.7;
        const logoH = height * 0.7;
        const logoGeo = new THREE.PlaneGeometry(logoW, logoH);
        const logoMat = new THREE.MeshBasicMaterial({
            map: logoTexture,
            side: THREE.DoubleSide
        });
        const logo = new THREE.Mesh(logoGeo, logoMat);
        logo.position.z = frameDepth * 0.5 + 0.001;
        group.add(logo);

        return group;
    }

    // 相框1 - 小红书logo
    const xhsTexture = textureLoader.load('xhs-logo-rgb.png', function(texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
    });
    xhsTexture.minFilter = THREE.LinearFilter;
    xhsTexture.magFilter = THREE.LinearFilter;

    const group1 = createRealFrame(xhsTexture, 0.42, 0.42, 0.05, 0.03);
    group1.position.set(-2.0, 3.16, -5.92);
    group1.userData = { name: 'frame1', displayName: '小红书矩阵' };
    scene.add(group1);
    roomObjects.frame1 = group1;

    // 相框2 - 抖音logo
    const douyinTexture = textureLoader.load('douyin-logo-rgb.png', function(texture) {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
    });
    douyinTexture.minFilter = THREE.LinearFilter;
    douyinTexture.magFilter = THREE.LinearFilter;

    const group2 = createRealFrame(douyinTexture, 0.42, 0.42, 0.05, 0.03);
    group2.position.set(-2.0, 2.46, -5.92);
    group2.userData = { name: 'frame2', displayName: '抖音' };
    scene.add(group2);
    roomObjects.frame2 = group2;

    // ========== 挂脖奖牌 - 两个横向排列 ==========
    function createNeckMedal(color, ribbonColor, icon, xOffset) {
        const group = new THREE.Group();

        const medalMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.25, metalness: 0.85 });
        const ribbonMat = new THREE.MeshStandardMaterial({ color: ribbonColor, roughness: 0.5 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.4 });

        // 挂绳 - V字形
        const ribbonWidth = 0.035;
        const ribbonThick = 0.004;
        const vHeight = 0.28;
        const vWidth = 0.12;

        // 左绳
        const leftRibbon = new THREE.Mesh(
            new THREE.BoxGeometry(ribbonWidth, Math.sqrt(vHeight * vHeight + (vWidth / 2) * (vWidth / 2)), ribbonThick),
            ribbonMat
        );
        leftRibbon.position.set(-vWidth / 4, vHeight / 2, -0.01);
        leftRibbon.rotation.z = Math.atan2(vWidth / 2, vHeight);
        group.add(leftRibbon);

        // 右绳
        const rightRibbon = new THREE.Mesh(
            new THREE.BoxGeometry(ribbonWidth, Math.sqrt(vHeight * vHeight + (vWidth / 2) * (vWidth / 2)), ribbonThick),
            ribbonMat
        );
        rightRibbon.position.set(vWidth / 4, vHeight / 2, -0.01);
        rightRibbon.rotation.z = -Math.atan2(vWidth / 2, vHeight);
        group.add(rightRibbon);

        // 绳结装饰
        const knot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 12), ribbonMat);
        knot.position.set(0, 0.02, 0.005);
        group.add(knot);

        // 奖牌主体 - 圆形，带厚度
        const medalRadius = 0.065;
        const medalThick = 0.018;
        const medalBody = new THREE.Mesh(
            new THREE.CylinderGeometry(medalRadius, medalRadius, medalThick, 32),
            medalMat
        );
        medalBody.rotation.x = Math.PI / 2;
        medalBody.position.y = -0.06;
        medalBody.castShadow = true;
        group.add(medalBody);

        // 奖牌边缘凸起环
        const edgeRing = new THREE.Mesh(
            new THREE.TorusGeometry(medalRadius, 0.006, 12, 32),
            new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.9 })
        );
        edgeRing.position.set(0, -0.06, medalThick / 2);
        group.add(edgeRing);

        // 内圈装饰环
        const innerRing = new THREE.Mesh(
            new THREE.TorusGeometry(medalRadius * 0.72, 0.003, 8, 32),
            new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.8 })
        );
        innerRing.position.set(0, -0.06, medalThick / 2 + 0.001);
        group.add(innerRing);

        // 中心图案底板
        const centerPlate = new THREE.Mesh(
            new THREE.CircleGeometry(medalRadius * 0.68, 32),
            new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.4 })
        );
        centerPlate.position.set(0, -0.06, medalThick / 2 + 0.002);
        group.add(centerPlate);

        // 中心图案 - 星星
        const starShape = new THREE.Shape();
        const outerR = medalRadius * 0.45;
        const innerR = medalRadius * 0.2;
        for (let i = 0; i < 10; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            if (i === 0) starShape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else starShape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        starShape.closePath();
        const starGeo = new THREE.ShapeGeometry(starShape, 16);
        const starMesh = new THREE.Mesh(starGeo, medalMat);
        starMesh.position.set(0, -0.06, medalThick / 2 + 0.003);
        group.add(starMesh);

        // 挂绳顶部小挂钩
        const hook = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.003, 8, 16, Math.PI), darkMat);
        hook.position.set(0, vHeight + 0.01, -0.01);
        hook.rotation.z = Math.PI;
        group.add(hook);

        group.position.set(xOffset, 3.0, -5.92);
        return group;
    }

    // 金色奖牌
    const medal1 = createNeckMedal(0xffd700, 0xc0392b, '⭐', 1.45);
    medal1.userData = { name: 'medal1', displayName: '奖牌' };
    scene.add(medal1);
    roomObjects.medal1 = medal1;

    // 银色奖牌
    const medal2 = createNeckMedal(0xc0c0c0, 0x2980b9, '🥇', 1.75);
    medal2.userData = { name: 'medal2', displayName: '奖牌' };
    scene.add(medal2);
    roomObjects.medal2 = medal2;

    // ========== 桌上立相框 — 台灯左侧（木质边框）=========
    const deskFrameGroup = new THREE.Group();
    const deskWoodFrameMat = new THREE.MeshStandardMaterial({ color: 0x8b5e3c, roughness: 0.6, metalness: 0.0 });
    const deskWoodDarkMat = new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.7, metalness: 0.0 });

    // 相框边框 — 3:4 比例立放（缩小尺寸）木质
    const dfW = 0.30, dfH = 0.40, dfD = 0.025;
    const dfBorder = new THREE.Mesh(new THREE.BoxGeometry(dfW, dfH, dfD), deskWoodFrameMat);
    dfBorder.castShadow = true;
    deskFrameGroup.add(dfBorder);

    // 相框内照片
    const photoTexture = textureLoader.load('photo-wall.jpeg');
    photoTexture.colorSpace = THREE.SRGBColorSpace;
    photoTexture.minFilter = THREE.LinearFilter;
    photoTexture.magFilter = THREE.LinearFilter;
    photoTexture.generateMipmaps = false;

    const dfInner = new THREE.Mesh(
        new THREE.BoxGeometry(dfW - 0.03, dfH - 0.03, 0.008),
        new THREE.MeshBasicMaterial({ map: photoTexture })
    );
    dfInner.position.z = dfD / 2 + 0.002;
    deskFrameGroup.add(dfInner);

    // 木质边框装饰 - 内边框线条
    const innerBorderH = new THREE.Mesh(
        new THREE.BoxGeometry(dfW - 0.01, 0.008, dfD + 0.003),
        deskWoodDarkMat
    );
    innerBorderH.position.z = 0.003;
    deskFrameGroup.add(innerBorderH);
    const innerBorderV = new THREE.Mesh(
        new THREE.BoxGeometry(0.008, dfH - 0.01, dfD + 0.003),
        deskWoodDarkMat
    );
    innerBorderV.position.z = 0.003;
    deskFrameGroup.add(innerBorderV);

    // 支架 — 木质支架，支撑相框向后倾斜
    const standH = 0.14;
    const standLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.015, standH, 0.015),
        deskWoodFrameMat
    );
    standLeg.position.set(0, -dfH / 2 + 0.04, -0.05);
    standLeg.rotation.x = -0.35;
    deskFrameGroup.add(standLeg);

    // 支架底部横杆
    const standFoot = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.015, 0.03),
        deskWoodFrameMat
    );
    standFoot.position.set(0, -dfH / 2 - 0.01, -0.08);
    deskFrameGroup.add(standFoot);

    // 位置：台灯左侧，书桌上
    deskFrameGroup.position.set(-1.4, 1.56 + dfH / 2, -3.3);
    // 向后倾斜约15度，像真实相框立在桌上；顺时针旋转60度（Y轴）
    deskFrameGroup.rotation.x = -0.25;
    deskFrameGroup.rotation.y = Math.PI / 3;
    deskFrameGroup.userData = { name: 'deskFrame', displayName: '照片', isPhoto: true };
    scene.add(deskFrameGroup);
    roomObjects.deskFrame = deskFrameGroup;
}

// ========================================
// 白板 — 现代磁性白板 + 便利贴
// ========================================
function createWhiteboardTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // 深灰色圆角边框
    const borderW = 24;
    const cornerR = 20;
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, cornerR);
    ctx.fill();

    // 白色书写面（内缩边框宽度）
    ctx.fillStyle = '#f8f8f8';
    ctx.beginPath();
    ctx.roundRect(borderW, borderW, w - borderW * 2, h - borderW * 2, cornerR - 4);
    ctx.fill();

    // 文字内容 - 手写风格
    ctx.fillStyle = '#2c2c2c';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 标题 - 手写体
    ctx.font = 'bold 64px "Comic Sans MS", "Chalkboard SE", "Bradley Hand", cursive, sans-serif';
    ctx.fillText('Welcome to Zoey\'s room~', 60, 45);

    // 分隔线 - 手绘风格（略带波浪）
    ctx.strokeStyle = '#bbbbbb';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(60, 135);
    for (let x = 60; x <= w - 60; x += 10) {
        const y = 135 + Math.sin(x * 0.05) * 2;
        ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Recent to-dos - 手写体
    ctx.font = 'bold 46px "Comic Sans MS", "Chalkboard SE", "Bradley Hand", cursive, sans-serif';
    ctx.fillText('Recent to-dos:', 60, 165);

    // 列表项 - 手写体，带轻微随机偏移模拟手写
    ctx.font = '40px "Comic Sans MS", "Chalkboard SE", "Bradley Hand", cursive, sans-serif';
    const items = [
        '1、A little bit of work and study',
        '2、Sleep, sleep, sleep, sleep',
        '3、Eat, eat, eat, eat'
    ];
    items.forEach((item, i) => {
        const y = 245 + i * 70;
        // 每个字符轻微随机偏移，模拟手写抖动
        let x = 60;
        for (let j = 0; j < item.length; j++) {
            const char = item[j];
            const offsetY = (Math.random() - 0.5) * 1.5;
            ctx.save();
            ctx.translate(x, y + offsetY);
            ctx.rotate((Math.random() - 0.5) * 0.03);
            ctx.fillText(char, 0, 0);
            ctx.restore();
            x += ctx.measureText(char).width;
        }
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    return texture;
}

function createWhiteboard() {
    const group = new THREE.Group();

    // 白板主体 — 使用纹理贴图（加宽加大，比笔记本电脑大）
    const boardW = 2.4, boardH = 1.4;
    const boardGeo = new THREE.BoxGeometry(boardW, boardH, 0.025);
    const boardTex = createWhiteboardTexture();
    const boardMat = new THREE.MeshStandardMaterial({
        map: boardTex,
        roughness: 0.6,
        metalness: 0.1
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    group.add(board);

    // 便利贴 — 3D方块贴在白板前方
    const noteColors = [COLORS.warm, COLORS.accentLight, COLORS.green];
    const notePositions = [[-0.55, -0.45], [0.15, -0.40], [0.65, -0.48]];
    notePositions.forEach((pos, i) => {
        const noteGeo = new THREE.BoxGeometry(0.18, 0.18, 0.008);
        const noteMat = new THREE.MeshStandardMaterial({ color: noteColors[i], roughness: 0.8 });
        const note = new THREE.Mesh(noteGeo, noteMat);
        note.position.set(pos[0], pos[1], 0.018);
        note.rotation.z = (Math.random() - 0.5) * 0.12;
        group.add(note);
    });

    group.position.set(-0.2, 2.7, -5.92);
    group.userData = { name: 'whiteboard', displayName: '白板' };
    scene.add(group);
    roomObjects.whiteboard = group;
}

// ========================================
// 相册墙 — 左边相框左侧的木质板子+两本相册
// ========================================
function createPhotoAlbumWall() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.7 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.8 });

    // 木质板子（搁板）
    const shelfW = 0.9, shelfD = 0.25, shelfThick = 0.04;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(shelfW, shelfThick, shelfD), woodMat);
    shelf.castShadow = true;
    group.add(shelf);

    // 支架（两个L形金属支架）
    const bracketMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.4, metalness: 0.6 });
    [-shelfW / 2 + 0.08, shelfW / 2 - 0.08].forEach(x => {
        const bracketV = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.15, 0.015), bracketMat);
        bracketV.position.set(x, -0.075, -0.02);
        group.add(bracketV);
        const bracketH = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.015, 0.12), bracketMat);
        bracketH.position.set(x, -0.15, -0.08);
        group.add(bracketH);
    });

    // 相册1 - 竖放直立，作为支撑
    const album1Group = new THREE.Group();
    const albumW = 0.18, albumH = 0.24, albumD = 0.03;
    const albumCoverMat = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: 0.6 });
    const albumPageMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.9 });
    // 封面
    const cover1 = new THREE.Mesh(new THREE.BoxGeometry(albumW, albumH, 0.005), albumCoverMat);
    cover1.position.z = albumD / 2;
    album1Group.add(cover1);
    // 书页
    const pages1 = new THREE.Mesh(new THREE.BoxGeometry(albumW - 0.01, albumH - 0.01, albumD - 0.01), albumPageMat);
    album1Group.add(pages1);
    // 装饰线
    const deco1 = new THREE.Mesh(new THREE.BoxGeometry(albumW - 0.04, 0.005, 0.006), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.5, roughness: 0.3 }));
    deco1.position.set(0, 0.06, albumD / 2 + 0.001);
    album1Group.add(deco1);
    // 直立，稍微歪一点
    album1Group.position.set(-0.08, albumH / 2 + shelfThick / 2, 0);
    album1Group.rotation.y = -0.08;
    group.add(album1Group);

    // 相册2 - 斜靠在相册1上
    const album2Group = new THREE.Group();
    const cover2 = new THREE.Mesh(new THREE.BoxGeometry(albumW, albumH, 0.005), new THREE.MeshStandardMaterial({ color: 0x2980b9, roughness: 0.6 }));
    cover2.position.z = albumD / 2;
    album2Group.add(cover2);
    const pages2 = new THREE.Mesh(new THREE.BoxGeometry(albumW - 0.01, albumH - 0.01, albumD - 0.01), albumPageMat);
    album2Group.add(pages2);
    const deco2 = new THREE.Mesh(new THREE.BoxGeometry(albumW - 0.04, 0.005, 0.006), new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.5, roughness: 0.3 }));
    deco2.position.set(0, 0.06, albumD / 2 + 0.001);
    album2Group.add(deco2);
    // 斜靠：底部贴着相册1底部，顶部向相册1倾斜
    album2Group.position.set(0.06, albumH / 2 + shelfThick / 2 - 0.01, 0.02);
    album2Group.rotation.x = -0.18; // 向相册1方向倾斜
    album2Group.rotation.y = 0.05;
    group.add(album2Group);

    // 位置：左边相框左侧（相框1在 x=-2.0）
    group.position.set(-2.9, 2.9, -5.92);
    group.userData = { name: 'photoAlbum', displayName: '生活相册' };
    scene.add(group);
    roomObjects.photoAlbum = group;
}

// ========================================
// 用户反馈 — 书桌左侧精致龟背竹绿植（参考图片精致化）
// ========================================
function createFeedbackBox() {
    const group = new THREE.Group();

    // ========== 白色陶瓷花盆（参考图片风格）==========
    const potWhiteMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f0,
        roughness: 0.25,
        metalness: 0.05
    });

    // 盆身 - 圆润蛋形，上宽下窄更柔和
    const potGeo = new THREE.SphereGeometry(0.22, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const potBody = new THREE.Mesh(potGeo, potWhiteMat);
    potBody.position.y = 0.18;
    potBody.scale.set(1, 0.85, 1);
    potBody.castShadow = true;
    group.add(potBody);

    // 盆口 - 平整的圆形开口
    const potRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.195, 0.015, 12, 32),
        potWhiteMat
    );
    potRim.position.y = 0.355;
    potRim.rotation.x = Math.PI / 2;
    group.add(potRim);

    // 盆口内沿
    const potTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.195, 0.185, 0.02, 32),
        potWhiteMat
    );
    potTop.position.y = 0.345;
    group.add(potTop);

    // 盆底 - 平整
    const potBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.015, 32),
        potWhiteMat
    );
    potBase.position.y = 0.007;
    group.add(potBase);

    // 土壤 - 深褐色，表面有苔藓点缀
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.95 });
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.175, 0.02, 32), soilMat);
    soil.position.y = 0.335;
    group.add(soil);

    // 苔藓点缀
    const mossMat = new THREE.MeshStandardMaterial({ color: 0x4a7c3f, roughness: 0.9 });
    for (let i = 0; i < 12; i++) {
        const moss = new THREE.Mesh(
            new THREE.SphereGeometry(0.012 + Math.random() * 0.008, 6, 6),
            mossMat
        );
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 0.14;
        moss.position.set(Math.cos(angle) * dist, 0.348, Math.sin(angle) * dist);
        moss.scale.y = 0.4;
        group.add(moss);
    }

    // ========== 茎干（参考图片：多根自然弯曲）==========
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x5d8c6a, roughness: 0.7 });

    // 辅助函数：创建自然弯曲的茎（用CatmullRom曲线）
    function createCurvedStem(points, radius, segments = 16) {
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, segments, radius, 8, false);
        const stem = new THREE.Mesh(tubeGeo, stemMat);
        stem.castShadow = true;
        return stem;
    }

    // 主茎 - 中央直立，顶部微弯
    const mainStem = createCurvedStem([
        new THREE.Vector3(0, 0.34, 0),
        new THREE.Vector3(0.005, 0.50, 0.005),
        new THREE.Vector3(-0.01, 0.70, -0.01),
        new THREE.Vector3(0.02, 0.90, 0.01),
        new THREE.Vector3(0.01, 1.10, 0.02),
    ], 0.022);
    group.add(mainStem);

    // 侧茎1 - 向右前方弯曲
    const stem1 = createCurvedStem([
        new THREE.Vector3(0.01, 0.36, 0.01),
        new THREE.Vector3(0.04, 0.52, 0.05),
        new THREE.Vector3(0.10, 0.72, 0.10),
        new THREE.Vector3(0.16, 0.92, 0.12),
        new THREE.Vector3(0.18, 1.08, 0.10),
    ], 0.016);
    group.add(stem1);

    // 侧茎2 - 向左前方弯曲
    const stem2 = createCurvedStem([
        new THREE.Vector3(-0.01, 0.35, 0.01),
        new THREE.Vector3(-0.05, 0.50, 0.04),
        new THREE.Vector3(-0.12, 0.68, 0.08),
        new THREE.Vector3(-0.18, 0.86, 0.10),
        new THREE.Vector3(-0.20, 1.02, 0.08),
    ], 0.014);
    group.add(stem2);

    // 侧茎3 - 向后方弯曲（较短）
    const stem3 = createCurvedStem([
        new THREE.Vector3(0, 0.38, -0.01),
        new THREE.Vector3(0.02, 0.54, -0.06),
        new THREE.Vector3(0.05, 0.72, -0.12),
        new THREE.Vector3(0.06, 0.88, -0.16),
    ], 0.012);
    group.add(stem3);

    // 侧茎4 - 矮茎，向右下方
    const stem4 = createCurvedStem([
        new THREE.Vector3(0.01, 0.34, 0),
        new THREE.Vector3(0.06, 0.46, 0.03),
        new THREE.Vector3(0.12, 0.58, 0.06),
        new THREE.Vector3(0.16, 0.68, 0.08),
    ], 0.010);
    group.add(stem4);

    // 侧茎5 - 矮茎，向左下方
    const stem5 = createCurvedStem([
        new THREE.Vector3(-0.01, 0.34, 0),
        new THREE.Vector3(-0.06, 0.44, 0.02),
        new THREE.Vector3(-0.12, 0.54, 0.05),
        new THREE.Vector3(-0.16, 0.64, 0.06),
    ], 0.009);
    group.add(stem5);

    // ========== 精致龟背竹叶片（参考图片风格）==========
    function createMonsteraLeaf(size, position, rotation, stemOffset = null) {
        const leafGroup = new THREE.Group();

        // 叶片材质 - 深绿色带光泽
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x1e5e3a,
            roughness: 0.45,
            metalness: 0.02,
            side: THREE.DoubleSide
        });
        const leafBackMat = new THREE.MeshStandardMaterial({
            color: 0x2a7048,
            roughness: 0.5,
            side: THREE.DoubleSide
        });

        // 主叶片形状 - 使用自定义形状模拟龟背竹轮廓
        const leafShape = new THREE.Shape();
        const r = size;
        // 绘制心形/卵形轮廓
        leafShape.moveTo(0, -r * 1.3);
        leafShape.bezierCurveTo(r * 0.8, -r * 1.2, r * 1.1, -r * 0.3, r * 0.9, r * 0.3);
        leafShape.bezierCurveTo(r * 0.8, r * 0.8, r * 0.4, r * 1.1, 0, r * 1.2);
        leafShape.bezierCurveTo(-r * 0.4, r * 1.1, -r * 0.8, r * 0.8, -r * 0.9, r * 0.3);
        leafShape.bezierCurveTo(-r * 1.1, -r * 0.3, -r * 0.8, -r * 1.2, 0, -r * 1.3);

        const leafGeo = new THREE.ShapeGeometry(leafShape, 24);
        const mainLeaf = new THREE.Mesh(leafGeo, leafMat);
        leafGroup.add(mainLeaf);

        // 龟背竹标志性裂口 - 用深色椭圆模拟
        const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f2e1c });
        const holePositions = [
            { x: 0, y: r * 0.5, rx: r * 0.15, ry: r * 0.25 },
            { x: r * 0.25, y: r * 0.15, rx: r * 0.12, ry: r * 0.18 },
            { x: -r * 0.25, y: r * 0.2, rx: r * 0.10, ry: r * 0.16 },
            { x: r * 0.35, y: -r * 0.15, rx: r * 0.08, ry: r * 0.14 },
            { x: -r * 0.3, y: -r * 0.1, rx: r * 0.09, ry: r * 0.13 },
            { x: 0, y: -r * 0.35, rx: r * 0.11, ry: r * 0.15 },
        ];
        holePositions.forEach(h => {
            // 使用椭圆曲线绘制孔洞（兼容Three.js r160）
            const holeShape = new THREE.Shape();
            const segments = 12;
            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const px = h.x + Math.cos(angle) * h.rx;
                const py = h.y + Math.sin(angle) * h.ry;
                if (i === 0) holeShape.moveTo(px, py);
                else holeShape.lineTo(px, py);
            }
            holeShape.closePath();
            const holeGeo = new THREE.ShapeGeometry(holeShape, 8);
            const hole = new THREE.Mesh(holeGeo, holeMat);
            hole.position.z = 0.001;
            leafGroup.add(hole);
        });

        // 叶脉 - 中央主脉
        const veinMat = new THREE.MeshStandardMaterial({ color: 0x3d8b5f, roughness: 0.5 });
        const mainVein = new THREE.Mesh(
            new THREE.BoxGeometry(size * 0.02, size * 2.2, 0.003),
            veinMat
        );
        leafGroup.add(mainVein);

        // 侧脉
        for (let i = -4; i <= 4; i++) {
            if (i === 0) continue;
            const yPos = i * size * 0.22;
            const veinLen = size * (0.55 - Math.abs(i) * 0.08);
            const sideVein = new THREE.Mesh(
                new THREE.BoxGeometry(veinLen, size * 0.008, 0.002),
                veinMat
            );
            sideVein.position.y = yPos;
            sideVein.rotation.z = i > 0 ? 0.15 : -0.15;
            leafGroup.add(sideVein);
        }

        // 叶柄
        const petioleMat = new THREE.MeshStandardMaterial({ color: 0x5d8c6a, roughness: 0.7 });
        const petioleLen = size * 0.5;
        const petiole = new THREE.Mesh(
            new THREE.CylinderGeometry(size * 0.035, size * 0.025, petioleLen, 6),
            petioleMat
        );
        petiole.position.y = -size * 1.4 - petioleLen / 2;
        leafGroup.add(petiole);

        // 叶片自然弯曲 - 微微向后倾斜
        leafGroup.rotation.x = 0.1;

        leafGroup.position.copy(position);
        leafGroup.rotation.set(rotation.x, rotation.y, rotation.z);
        leafGroup.castShadow = true;
        return leafGroup;
    }

    // 添加叶片 - 参考图片布局：7-8片，大小不一，自然展开
    const leaves = [
        // 顶部大叶
        { size: 0.26, pos: new THREE.Vector3(0.01, 1.12, 0.02), rot: { x: -0.4, y: 0.2, z: 0.05 } },
        // 右上大叶
        { size: 0.24, pos: new THREE.Vector3(0.20, 1.08, 0.10), rot: { x: -0.5, y: 0.6, z: 0.2 } },
        // 左上大叶
        { size: 0.23, pos: new THREE.Vector3(-0.20, 1.02, 0.08), rot: { x: -0.45, y: -0.7, z: -0.15 } },
        // 右中中叶
        { size: 0.20, pos: new THREE.Vector3(0.18, 0.88, 0.14), rot: { x: -0.35, y: 1.0, z: 0.3 } },
        // 左中中叶
        { size: 0.19, pos: new THREE.Vector3(-0.18, 0.84, 0.12), rot: { x: -0.3, y: -1.1, z: -0.25 } },
        // 后中叶片
        { size: 0.18, pos: new THREE.Vector3(0.06, 0.92, -0.14), rot: { x: -0.6, y: 0.4, z: 0.1 } },
        // 右下小叶
        { size: 0.16, pos: new THREE.Vector3(0.16, 0.70, 0.10), rot: { x: -0.2, y: 1.3, z: 0.4 } },
        // 左下小叶
        { size: 0.15, pos: new THREE.Vector3(-0.16, 0.66, 0.08), rot: { x: -0.15, y: -1.4, z: -0.35 } },
    ];

    leaves.forEach(l => {
        const leaf = createMonsteraLeaf(l.size, l.pos, l.rot);
        group.add(leaf);
    });

    // ========== 装饰：小标签牌（心语盆栽）==========
    const tagGroup = new THREE.Group();
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.8 });
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.18, 6), stickMat);
    stick.position.y = 0.09;
    tagGroup.add(stick);

    const tagMat = new THREE.MeshStandardMaterial({ color: 0xfff8e7, roughness: 0.7 });
    const tag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.003), tagMat);
    tag.position.y = 0.18;
    tag.rotation.y = 0.2;
    tagGroup.add(tag);

    const tagBorder = new THREE.Mesh(
        new THREE.BoxGeometry(0.062, 0.042, 0.002),
        new THREE.MeshStandardMaterial({ color: 0x8b6914, roughness: 0.6 })
    );
    tagBorder.position.y = 0.18;
    tagBorder.position.z = -0.001;
    tagBorder.rotation.y = 0.2;
    tagGroup.add(tagBorder);

    tagGroup.position.set(0.12, 0.26, 0.12);
    tagGroup.rotation.z = 0.05;
    tagGroup.rotation.x = -0.1;
    group.add(tagGroup);

    // 位置：书桌左侧地面上
    group.position.set(-2.2, 0, -3.2);
    group.userData = { name: 'feedback', displayName: '心语盆栽' };
    scene.add(group);
    roomObjects.feedback = group;
}

// ========================================
// 地毯 — 程序化织物纹理
// ========================================
function createFabricTexture(width, height, baseColor, patternColor) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 基础底色
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // 编织纹理 — 水平线
    for (let y = 0; y < height; y += 3) {
        ctx.strokeStyle = patternColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4 + Math.random() * 0.2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // 编织纹理 — 垂直线（稀疏）
    for (let x = 0; x < width; x += 4) {
        ctx.strokeStyle = patternColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3 + Math.random() * 0.2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // 添加噪点模拟毛茸感
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 20;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }
    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 6);
    return texture;
}

function createFabricBumpMap(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // 灰度凹凸贴图
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, width, height);

    // 编织凸起 — 水平
    for (let y = 0; y < height; y += 3) {
        ctx.strokeStyle = Math.random() > 0.5 ? '#a0a0a0' : '#606060';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // 编织凸起 — 垂直
    for (let x = 0; x < width; x += 4) {
        ctx.strokeStyle = Math.random() > 0.5 ? '#a0a0a0' : '#606060';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 6);
    return texture;
}

function createCarpet() {
    const carpetGeo = new THREE.PlaneGeometry(4.2, 3.6, 64, 64);

    // 生成织物纹理和凹凸贴图
    const fabricTex = createFabricTexture(512, 512, '#c4956a', '#a07040');
    const bumpTex = createFabricBumpMap(512, 512);

    const carpetMat = new THREE.MeshStandardMaterial({
        map: fabricTex,
        bumpMap: bumpTex,
        bumpScale: 0.08,
        roughness: 0.95,
        metalness: 0.0,
        color: COLORS.rug
    });

    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(0, 0.005, -2.6);
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

    // 绑定书架内书籍点击事件
    if (objectName === 'bookshelf') {
        bindBookCardEvents();
    }

    // 绑定反馈表单提交事件
    if (objectName === 'feedback') {
        bindFeedbackFormEvent();
    }

    // 绑定相册图片点击放大事件
    if (objectName === 'photoAlbum') {
        bindPhotoGalleryEvents();
    }
}

function bindBookCardEvents() {
    const grid = document.getElementById('bookshelf-grid');
    if (!grid) return;
    grid.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', () => {
            const idx = parseInt(card.dataset.book, 10);
            if (bookDetails[idx]) showBookDetail(idx);
        });
    });
}

function bindPhotoGalleryEvents() {
    const gallery = document.querySelector('.photo-gallery');
    if (!gallery) return;
    gallery.querySelectorAll('img').forEach(img => {
        img.addEventListener('click', () => {
            showPhotoLightbox(img.src);
        });
    });
}

let currentBookIndex = 0;

function showBookDetail(index) {
    currentBookIndex = index;
    const book = bookDetails[index];
    if (!book) return;

    // 给弹窗添加书籍详情专用类名，让弹窗更宽
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) modalContent.classList.add('book-detail-modal');

    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <div class="book-detail">
            <div class="book-detail-left">
                <img src="${book.cover}" class="book-detail-cover" alt="${book.title}">
                <h3 class="book-detail-title">${book.title}</h3>
                <p class="book-detail-author">${book.author}</p>
            </div>
            <div class="book-detail-right">
                <p class="book-detail-desc">${book.desc}</p>
                <div class="book-detail-nav">
                    <a href="${book.link}" class="book-detail-link" target="_blank" rel="noopener">查看详情页 →</a>
                    <button class="book-detail-back" id="book-detail-back-btn">← 返回书单</button>
                </div>
            </div>
        </div>
    `;

    // 绑定返回书单按钮事件
    const backBtn = document.getElementById('book-detail-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', restoreBookshelfGrid);
    }
}

function restoreBookshelfGrid() {
    // 移除书籍详情专用宽度类名
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) modalContent.classList.remove('book-detail-modal');

    const data = objectData['bookshelf'];
    if (!data) return;
    document.getElementById('modal-body').innerHTML = data.content;
    bindBookCardEvents();
    // 返回书单时恢复默认视角
    returnToDefaultView();
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    selectedObject = null;
    // 恢复相机到默认视角
    returnToDefaultView();
}

function returnToDefaultView() {
    animateCameraTo(-0.5, 1.15, 8, new THREE.Vector3(0, 1.2, -3.0));
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
// 音乐播放器
// ========================================
function initMusicPlayer() {
    const musicPlayer = document.getElementById('music-player');
    const musicToggle = document.getElementById('music-toggle');
    const iconPause = document.getElementById('music-icon-pause');
    const iconPlay = document.getElementById('music-icon-play');
    const musicCover = musicPlayer.querySelector('.music-cover');
    const musicLyric = document.getElementById('music-lyric');

    if (!musicPlayer || !musicToggle) return;

    // 创建音频元素
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    bgMusic.src = 'pillow.mp3';

    // 歌词数据 - Pillow by 早安（基于音频能量分析精确校准）
    const lyrics = [
        { time: 0.0, text: "♪ Pillow - 早安" },
        { time: 1.6, text: "为什么还没回来" },
        { time: 3.2, text: "我对着窗口发呆" },
        { time: 4.8, text: "说好了六点半" },
        { time: 6.3, text: "三点半就开始不耐烦" },
        { time: 7.9, text: "我要耍赖 That's all my life without you so boring" },
        { time: 9.5, text: "拉长了倒影的电线杆 说我发呆还在啰嗦" },
        { time: 11.1, text: "怪我总太过火" },
        { time: 12.7, text: "从夕阳等到月亮" },
        { time: 14.3, text: "路灯也说我倔强" },
        { time: 15.9, text: "这时间太长 就在等门铃响" },
        { time: 17.5, text: "都关掉了音响 我要你抱着或者靠着" },
        { time: 19.1, text: "Like a pillow" },
        { time: 20.7, text: "Like a pillow" },
        { time: 22.3, text: "悄悄把你眼泪带走 Like a pillow" },
        { time: 23.9, text: "等你回来 Just lay back" },
        { time: 25.5, text: "Like a pillow" },
        { time: 27.1, text: "悄悄把你眼泪带走 Like a pillow" },
        { time: 28.7, text: "这里不许有哀愁" },
        { time: 30.3, text: "我听见门铃叮咚" },
        { time: 31.9, text: "看到你并不轻松" },
        { time: 33.5, text: "抱着我跳进云中吧" },
        { time: 35.1, text: "在这里你不用八面玲珑" },
        { time: 36.7, text: "别再想人际或分数" },
        { time: 38.3, text: "羽毛有合适的温度" },
        { time: 39.9, text: "我比你想象的柔软 也比你想象的勇敢" },
        { time: 41.5, text: "Just be yourself" },
        { time: 43.1, text: "别再想该怎么回接到他电话你该怎么喂" },
        { time: 44.7, text: "没谁能永远原谅谁" },
        { time: 46.3, text: "但我想明天是个better day" },
        { time: 47.9, text: "It's gonna be a better day" },
        { time: 49.5, text: "睡吧睡吧 我是你梦里的盔甲" },
        { time: 51.1, text: "对吗 对啊 总是为别人不累吗" },
        { time: 52.7, text: "好吧想哭就哭 今天就是小气" },
        { time: 54.3, text: "但记得抱着我 眼泪我对别人保密" },
        { time: 55.9, text: "Like a pillow" },
        { time: 57.5, text: "悄悄把你眼泪带走 Like a pillow" },
        { time: 59.1, text: "等你回来 Just lay back" },
        { time: 60.7, text: "Like a pillow" },
        { time: 62.3, text: "悄悄把你眼泪带走 Like a pillow" },
        { time: 63.9, text: "这里不许有哀愁" },
        { time: 65.5, text: "My baby pillow My baby pillow" },
        { time: 67.1, text: "Like a pillow" },
        { time: 68.7, text: "悄悄把你眼泪带走 Like a pillow" },
        { time: 70.3, text: "等你回来 Just lay back" },
        { time: 71.9, text: "Like a pillow" },
        { time: 73.5, text: "悄悄把你眼泪带走 Like a pillow" },
        { time: 75.1, text: "这里不许有哀愁" },
        { time: 76.7, text: "Like a pillow Like a pillow Like a pillow" }
    ];
    let lyricIndex = 0;
    let lyricInterval = null;

    function updateLyric() {
        if (!musicLyric || !isMusicPlaying) return;
        const currentTime = bgMusic.currentTime || 0;
        // 找到当前应该显示的歌词
        for (let i = lyrics.length - 1; i >= 0; i--) {
            if (currentTime >= lyrics[i].time) {
                if (lyricIndex !== i) {
                    lyricIndex = i;
                    musicLyric.textContent = lyrics[i].text;
                    musicLyric.classList.add('visible');
                }
                break;
            }
        }
    }

    function startLyricSync() {
        if (lyricInterval) clearInterval(lyricInterval);
        // 立即显示第一行歌词
        if (musicLyric && lyrics.length > 0) {
            musicLyric.textContent = lyrics[0].text;
            musicLyric.classList.add('visible');
        }
        lyricInterval = setInterval(updateLyric, 200);
    }

    function stopLyricSync() {
        if (lyricInterval) {
            clearInterval(lyricInterval);
            lyricInterval = null;
        }
        if (musicLyric) {
            musicLyric.classList.remove('visible');
        }
    }

    function updateIcon() {
        if (isMusicPlaying) {
            iconPause.classList.remove('hidden');
            iconPlay.classList.add('hidden');
            if (musicCover) musicCover.classList.add('spinning');
            startLyricSync();
        } else {
            iconPause.classList.add('hidden');
            iconPlay.classList.remove('hidden');
            if (musicCover) musicCover.classList.remove('spinning');
            stopLyricSync();
        }
    }

    function playMusic() {
        if (!bgMusic) return;
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isMusicPlaying = true;
                updateIcon();
            }).catch(err => {
                // 自动播放被浏览器阻止，等待用户交互
                isMusicPlaying = false;
                updateIcon();
            });
        }
    }

    function pauseMusic() {
        if (!bgMusic) return;
        bgMusic.pause();
        isMusicPlaying = false;
        updateIcon();
    }

    function toggleMusic() {
        if (isMusicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    }

    musicToggle.addEventListener('click', toggleMusic);

    // 页面加载完成后尝试自动播放
    // 现代浏览器通常会阻止自动播放，需要用户交互后才能播放
    setTimeout(() => {
        playMusic();
    }, 800);

    // 监听首次用户交互（点击/触摸），用于解锁自动播放
    function unlockAudio() {
        if (!isMusicPlaying && bgMusic) {
            playMusic();
        }
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
    }
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });

    // 显示播放器UI（等进入引导层关闭后再显示）
    // 由 entry button 点击后统一显示
}

// ========================================
// 进入引导层
// ========================================
function initEntryOverlay() {
    const entryOverlay = document.getElementById('entry-overlay');
    const entryBtn = document.getElementById('entry-btn');
    const musicPlayer = document.getElementById('music-player');

    if (!entryOverlay || !entryBtn) return;

    entryBtn.addEventListener('click', () => {
        entryOverlay.classList.remove('active');
        entryOverlay.classList.add('hidden');
        // 显示音乐播放器
        if (musicPlayer) musicPlayer.classList.add('visible');
        // 尝试播放音乐
        if (!isMusicPlaying && bgMusic) {
            playMusic();
        }
    });
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
            cameraAngle.phi = Math.max(0.15, Math.min(Math.PI - 0.2, cameraAngle.phi));
            cameraAngle.theta = Math.max(-Math.PI * 0.85, Math.min(Math.PI * 0.85, cameraAngle.theta));
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

    // 键盘快捷键：R 键重置视角
    window.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            returnToDefaultView();
        }
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
            cameraAngle.phi = Math.max(0.15, Math.min(Math.PI - 0.2, cameraAngle.phi));
            cameraAngle.theta = Math.max(-Math.PI * 0.85, Math.min(Math.PI * 0.85, cameraAngle.theta));
            updateCameraPosition();
            previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        } else if (e.touches.length === 2) {
            // 双指缩放
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const scale = touchStartDistance / distance;
            cameraDistance = Math.max(3, Math.min(20, cameraDistance * scale));
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

    // 滚轮支持：鼠标滚轮缩放 + 触控板双指滑动旋转
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            // 垂直滚动 = 缩放（鼠标滚轮）
            cameraDistance = Math.max(3, Math.min(20, cameraDistance + e.deltaY * 0.008));
        } else {
            // 水平滚动 = 旋转（触控板左右滑动）
            cameraAngle.theta += e.deltaX * 0.003;
        }
        cameraAngle.phi += e.deltaY * 0.002;
        cameraAngle.phi = Math.max(0.15, Math.min(Math.PI - 0.2, cameraAngle.phi));
        cameraAngle.theta = Math.max(-Math.PI * 0.85, Math.min(Math.PI * 0.85, cameraAngle.theta));
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
    // 如果已聚焦白板，点击任意位置都退出聚焦回到默认视角
    if (selectedObject && selectedObject.userData.name === 'whiteboard') {
        selectedObject = null;
        returnToDefaultView();
        return;
    }

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
        if (obj.userData.name) {
            // 台灯特殊处理：点击切换光源，不弹窗不移动相机
            if (obj.userData.name === 'lamp') {
                toggleLampLight();
                return;
            }
            // 桌上立相框特殊处理：点击先推进再放大图片
            if (obj.userData.name === 'deskFrame') {
                selectedObject = obj;
                const box = new THREE.Box3().setFromObject(obj);
                const center = box.getCenter(new THREE.Vector3());
                const offset = new THREE.Vector3(
                    Math.sin(cameraAngle.theta) * 2,
                    0.3,
                    Math.cos(cameraAngle.theta) * 2
                );
                const camPos = center.clone().add(offset);
                const targetTheta = Math.atan2(camPos.x - center.x, camPos.z - center.z);
                animateCameraTo(targetTheta, 1.2, 3.5, center);
                setTimeout(() => showPhotoLightbox(), 500);
                return;
            }
            // 相册特殊处理：点击聚焦后展示生活照弹窗
            if (obj.userData.name === 'photoAlbum') {
                selectedObject = obj;
                const box = new THREE.Box3().setFromObject(obj);
                const center = box.getCenter(new THREE.Vector3());
                // 相机从正面看向相册（相册在墙上，从正前方看）
                const targetTheta = 0; // 从正前方看
                animateCameraTo(targetTheta, 1.2, 3.5, center);
                setTimeout(() => showModal('photoAlbum'), 600);
                return;
            }
            // 奖牌1特殊处理：点击放大展示图片
            if (obj.userData.name === 'medal1') {
                showPhotoLightbox('medal1-image.jpeg');
                return;
            }
            // 奖牌2特殊处理：点击展示荣誉奖项弹窗
            if (obj.userData.name === 'medal2') {
                showModal('medal2');
                return;
            }
            // 白板特殊处理：点击聚焦
            if (obj.userData.name === 'whiteboard') {
                selectedObject = obj;
                const box = new THREE.Box3().setFromObject(obj);
                const center = box.getCenter(new THREE.Vector3());
                const offset = new THREE.Vector3(
                    Math.sin(cameraAngle.theta) * 3,
                    0.5,
                    Math.cos(cameraAngle.theta) * 3
                );
                const camPos = center.clone().add(offset);
                const targetTheta = Math.atan2(camPos.x - center.x, camPos.z - center.z);
                animateCameraTo(targetTheta, 1.2, 4.5, center);
                return;
            }
            if (!objectData[obj.userData.name]) return;
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

// 照片放大查看
function showPhotoLightbox(imageSrc = 'photo-wall.jpeg') {
    const lightbox = document.createElement('div');
    lightbox.id = 'photo-lightbox';
    lightbox.className = 'photo-lightbox';
    lightbox.innerHTML = `
        <div class="photo-lightbox-overlay"></div>
        <img src="${imageSrc}" class="photo-lightbox-img" alt="照片">
        <button class="photo-lightbox-close">&times;</button>
    `;
    document.body.appendChild(lightbox);

    // 强制重绘后添加 active 类触发过渡动画
    requestAnimationFrame(() => {
        lightbox.classList.add('active');
    });

    const close = () => {
        lightbox.classList.remove('active');
        setTimeout(() => lightbox.remove(), 300);
        // 关闭照片放大后恢复默认视角
        returnToDefaultView();
    };

    lightbox.querySelector('.photo-lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.photo-lightbox-overlay').addEventListener('click', close);
}

// 台灯光源切换：仅控制台灯自身光源，不影响房间全局光照
// 冷光(0) → 暖光(1) → 关灯(2) → 冷光(0)
function toggleLampLight() {
    lampMode = (lampMode + 1) % 3;

    if (lampMode === 0) {
        // 冷白光（默认）
        if (lampLight) {
            lampLight.color.setHex(0xfff0d0);
            lampLight.intensity = 0.6;
        }
        if (bulbMat) {
            bulbMat.color.setHex(0xfff8e7);
            bulbMat.emissive.setHex(0xfff8e7);
            bulbMat.emissiveIntensity = 0.6;
        }
    } else if (lampMode === 1) {
        // 暖黄光
        if (lampLight) {
            lampLight.color.setHex(0xffaa55);
            lampLight.intensity = 0.8;
        }
        if (bulbMat) {
            bulbMat.color.setHex(0xffcc88);
            bulbMat.emissive.setHex(0xffaa55);
            bulbMat.emissiveIntensity = 1.0;
        }
    } else {
        // 关灯
        if (lampLight) {
            lampLight.intensity = 0;
        }
        if (bulbMat) {
            bulbMat.color.setHex(0x444444);
            bulbMat.emissive.setHex(0x000000);
            bulbMat.emissiveIntensity = 0;
        }
    }
}

// 可交互对象名称列表（包括objectData中的和特殊处理的）
const INTERACTIVE_NAMES = new Set([
    'laptop', 'lamp', 'bookshelf', 'chair',
    'frame1', 'frame2', 'deskFrame', 'medal1', 'medal2',
    'whiteboard', 'coffee',
    'photoAlbum', 'feedback'
]);

function isInteractive(obj) {
    return obj.userData.name && INTERACTIVE_NAMES.has(obj.userData.name);
}

function getDisplayName(obj) {
    const name = obj.userData.name;
    if (objectData[name]) {
        // 如果有desc，返回 name + desc 格式
        if (objectData[name].desc) {
            return `${objectData[name].name} · ${objectData[name].desc}`;
        }
        return objectData[name].name;
    }
    return obj.userData.displayName || name;
}

function getIcon(obj) {
    const name = obj.userData.name;
    if (objectData[name]) return objectData[name].icon;
    return '👆';
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
        if (isInteractive(obj)) {
            tooltip.innerHTML = `<strong>${getIcon(obj)} ${getDisplayName(obj)}</strong>`;
            tooltip.style.left = clientX + 15 + 'px';
            tooltip.style.top = clientY + 15 + 'px';
            tooltip.classList.add('visible');
            canvasEl.classList.add('hovering');

            if (hoveredObject !== obj) {
                if (hoveredObject) clearHoverState(hoveredObject);
                hoveredObject = obj;
                applyHoverState(hoveredObject);
            }
            return;
        }
    }

    tooltip.classList.remove('visible');
    canvasEl.classList.remove('hovering');
    if (hoveredObject) {
        clearHoverState(hoveredObject);
        hoveredObject = null;
    }
}

// 悬停状态：仅放大，无白边
function applyHoverState(objectGroup) {
    // 记录原始缩放
    if (!objectGroup.userData.originalScale) {
        objectGroup.userData.originalScale = objectGroup.scale.clone();
    }
    // 轻微放大（1.05倍）
    const orig = objectGroup.userData.originalScale;
    objectGroup.scale.set(orig.x * 1.05, orig.y * 1.05, orig.z * 1.05);
}

function clearHoverState(objectGroup) {
    // 恢复原始缩放
    if (objectGroup.userData.originalScale) {
        const orig = objectGroup.userData.originalScale;
        objectGroup.scale.set(orig.x, orig.y, orig.z);
    }
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

// ========================================
// 反馈表单提交处理 - 保存到本地 JSON 文件
// ========================================
function bindFeedbackFormEvent() {
    const form = document.getElementById('feedback-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('feedback-name');
        const msgInput = document.getElementById('feedback-msg');
        const name = nameInput.value.trim() || '匿名访客';
        const message = msgInput.value.trim();

        if (!message) {
            showFeedbackToast('请写下你的留言再提交哦～', 'warning');
            return;
        }

        // 显示发送中状态
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '保存中...';
        submitBtn.disabled = true;

        // 构建反馈数据
        const feedbackData = {
            id: Date.now(),
            name: name,
            message: message,
            time: new Date().toLocaleString('zh-CN'),
            timestamp: Date.now()
        };

        try {
            // 发送到本地 API 保存到 JSON 文件
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });

            if (response.ok) {
                showFeedbackToast('感谢你的留言，已保存～', 'success');
                msgInput.value = '';
                nameInput.value = '';
            } else {
                throw new Error('保存失败');
            }
        } catch (err) {
            // 如果 API 不可用（静态服务器），降级保存到 localStorage
            const existing = JSON.parse(localStorage.getItem('feedbacks') || '[]');
            existing.push(feedbackData);
            localStorage.setItem('feedbacks', JSON.stringify(existing));
            showFeedbackToast('感谢你的留言，已保存～', 'success');
            msgInput.value = '';
            nameInput.value = '';
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// 反馈提示 toast
function showFeedbackToast(message, type = 'success') {
    // 移除已有的 toast
    const existing = document.getElementById('feedback-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'feedback-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-20px);
        background: ${type === 'success' ? '#34c759' : '#ff9500'};
        color: #fff;
        padding: 0.8rem 1.6rem;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s ease;
        pointer-events: none;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    // 触发动画
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // 3秒后自动消失
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

init();
