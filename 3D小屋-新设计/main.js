let scene,camera,renderer,clock,raycaster,mouse;
let interactables=[],interactiveGroups={};
let cam={t:0.4,p:1.15,d:13,target:new THREE.Vector3(0,1.5,0)};
let isDragging=false,dragStart={x:0,y:0},animFocus=null,hovered=null;
const M={};

function init(){
    clock=new THREE.Clock();
    scene=new THREE.Scene();
    scene.background=new THREE.Color(0x1a1210);
    scene.fog=new THREE.FogExp2(0x1a1210,0.025);
    camera=new THREE.PerspectiveCamera(55,window.innerWidth/window.innerHeight,0.1,100);
    updateCamera();
    renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    document.getElementById('scene-container').appendChild(renderer.domElement);
    createMaterials();createLights();createRoom();
    createDesk();createChair();createBookshelf();createFrames();
    createGuitar();createSports();createWallAwards();createDeskFiles();
    createExtras();
    raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
    setupEvents();buildNav();
    setTimeout(()=>document.getElementById('loader').classList.add('hidden'),600);
    animate();
}

function createMaterials(){
    M.wood=new THREE.MeshStandardMaterial({color:0x8b6f47,roughness:.75});
    M.woodD=new THREE.MeshStandardMaterial({color:0x5c4033,roughness:.8});
    M.woodL=new THREE.MeshStandardMaterial({color:0xa68b5b,roughness:.7});
    M.metal=new THREE.MeshStandardMaterial({color:0x888,roughness:.3,metalness:.8});
    M.metalD=new THREE.MeshStandardMaterial({color:0x444,roughness:.4,metalness:.7});
    M.gold=new THREE.MeshStandardMaterial({color:0xd4a853,roughness:.25,metalness:.85});
    M.goldB=new THREE.MeshStandardMaterial({color:0xf0c86e,roughness:.2,metalness:.9,emissive:0xd4a853,emissiveIntensity:.08});
    M.glass=new THREE.MeshStandardMaterial({color:0xa8d4f0,roughness:.1,metalness:.3,transparent:true,opacity:.35,emissive:0x87ceeb,emissiveIntensity:.15});
    M.wall=new THREE.MeshStandardMaterial({color:0x3d2e25,roughness:.92});
    M.floor=new THREE.MeshStandardMaterial({color:0x7a6240,roughness:.85});
    M.screen=new THREE.MeshStandardMaterial({color:0x222a3a,roughness:.2,metalness:.3,emissive:0x6c5ce7,emissiveIntensity:.4});
    M.leather=new THREE.MeshStandardMaterial({color:0x3a2520,roughness:.7});
    M.guitarW=new THREE.MeshStandardMaterial({color:0xb8860b,roughness:.6});
    M.guitarD=new THREE.MeshStandardMaterial({color:0x2a1a0a,roughness:.7});
    M.tennis=new THREE.MeshStandardMaterial({color:0xc8e030,roughness:.6});
    M.ribbon=new THREE.MeshStandardMaterial({color:0xc0392b,roughness:.6});
    M.frameG=new THREE.MeshStandardMaterial({color:0xd4a853,roughness:.3,metalness:.7});
}

function createLights(){
    scene.add(new THREE.AmbientLight(0xfff0dd,.35));
    const ml=new THREE.DirectionalLight(0xffd4a8,.55);
    ml.position.set(6,10,4);ml.castShadow=true;
    ml.shadow.mapSize.set(2048,2048);
    ml.shadow.camera.left=-12;ml.shadow.camera.right=12;
    ml.shadow.camera.top=12;ml.shadow.camera.bottom=-12;
    scene.add(ml);
    const ll=new THREE.PointLight(0xffcc77,.7,6);
    ll.position.set(2.5,3,-3.5);ll.castShadow=true;
    scene.add(ll);
    const wl=new THREE.PointLight(0xa8d4f0,.25,8);
    wl.position.set(5.5,3.5,0);scene.add(wl);
}

function createRoom(){
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(14,14),M.floor);
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    const lm=new THREE.LineBasicMaterial({color:0x6d5a3d,transparent:true,opacity:.4});
    for(let i=-6;i<=6;i+=1.5){
        const pts=[new THREE.Vector3(i,.005,-7),new THREE.Vector3(i,.005,7)];
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lm));
    }
    const wg=new THREE.PlaneGeometry(14,7);
    const bw=new THREE.Mesh(wg,M.wall);bw.position.set(0,3.5,-7);bw.receiveShadow=true;scene.add(bw);
    const lw=new THREE.Mesh(wg,M.wall.clone());lw.position.set(-7,3.5,0);lw.rotation.y=Math.PI/2;lw.receiveShadow=true;scene.add(lw);
    const rw=new THREE.Mesh(wg,M.wall.clone());rw.position.set(7,3.5,0);rw.rotation.y=-Math.PI/2;rw.receiveShadow=true;scene.add(rw);
    const ceil=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.MeshStandardMaterial({color:0x1e1612,roughness:1}));
    ceil.rotation.x=Math.PI/2;ceil.position.y=7;scene.add(ceil);
    // 吊灯
    const cl=new THREE.Mesh(new THREE.CylinderGeometry(.3,.4,.15,16),new THREE.MeshStandardMaterial({color:0xfaf0dd,emissive:0xfff5e0,emissiveIntensity:.6,roughness:.3}));
    cl.position.set(0,6.9,-2);scene.add(cl);
    const cord=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,1.5,4),M.metalD);
    cord.position.set(0,6.1,-2);scene.add(cord);
    // 地毯
    const rug=new THREE.Mesh(new THREE.CircleGeometry(2.2,32),new THREE.MeshStandardMaterial({color:0x6d3a2a,roughness:1}));
    rug.rotation.x=-Math.PI/2;rug.position.set(2,.01,-3.5);rug.receiveShadow=true;scene.add(rug);
    const rr=new THREE.Mesh(new THREE.RingGeometry(2.0,2.2,32),new THREE.MeshStandardMaterial({color:0xd4a853,roughness:.8}));
    rr.rotation.x=-Math.PI/2;rr.position.set(2,.015,-3.5);scene.add(rr);
    // 窗户
    const wg2=new THREE.Group();
    wg2.add(new THREE.Mesh(new THREE.BoxGeometry(.12,3.2,2.4),M.gold));
    wg2.add(new THREE.Mesh(new THREE.BoxGeometry(.04,2.9,2.1),M.glass));
    wg2.add(new THREE.Mesh(new THREE.BoxGeometry(.1,.04,2.1),M.gold));
    wg2.add(new THREE.Mesh(new THREE.BoxGeometry(.1,2.9,.04),M.gold));
    wg2.position.set(6.9,3.8,0);wg2.rotation.y=-Math.PI/2;scene.add(wg2);
}

function createDesk(){
    const g=new THREE.Group();
    const top=new THREE.Mesh(new THREE.BoxGeometry(2.6,.08,1.3),M.woodL);
    top.position.y=1.25;top.castShadow=true;top.receiveShadow=true;g.add(top);
    const lg=new THREE.BoxGeometry(.08,1.25,.08);
    [[-1.2,.625,.55],[1.2,.625,.55],[-1.2,.625,-.55],[1.2,.625,-.55]].forEach(p=>{
        const l=new THREE.Mesh(lg,M.woodD);l.position.set(...p);l.castShadow=true;g.add(l);
    });
    // 抽屉
    const dc=new THREE.Mesh(new THREE.BoxGeometry(.7,.9,1.1),M.woodD);
    dc.position.set(-.9,.8,0);dc.castShadow=true;g.add(dc);
    for(let i=0;i<3;i++){
        const pn=new THREE.Mesh(new THREE.BoxGeometry(.65,.25,.02),M.wood);
        pn.position.set(-.9,.5+i*.3,.56);g.add(pn);
        const hd=new THREE.Mesh(new THREE.BoxGeometry(.08,.02,.02),M.metal);
        hd.position.set(-.9,.5+i*.3,.58);g.add(hd);
    }
    // 显示器
    const mon=new THREE.Mesh(new THREE.BoxGeometry(1.1,.7,.03),M.metalD);
    mon.position.set(.2,1.75,-.35);mon.castShadow=true;g.add(mon);
    const scr=new THREE.Mesh(new THREE.BoxGeometry(1.0,.6,.01),M.screen);
    scr.position.set(.2,1.75,-.33);g.add(scr);
    const sa=new THREE.Mesh(new THREE.BoxGeometry(.15,.12,.1),M.metalD);
    sa.position.set(.2,1.34,-.35);g.add(sa);
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.04,.35,.04),M.metalD);
    arm.position.set(.2,1.52,-.35);g.add(arm);
    // 键盘鼠标
    const kb=new THREE.Mesh(new THREE.BoxGeometry(.6,.025,.18),new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:.4}));
    kb.position.set(.1,1.3,.15);g.add(kb);
    const pad=new THREE.Mesh(new THREE.BoxGeometry(.28,.005,.22),new THREE.MeshStandardMaterial({color:0x1a1a2e,roughness:.9}));
    pad.position.set(.55,1.3,.15);g.add(pad);
    const ms=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),new THREE.MeshStandardMaterial({color:0x333,roughness:.4}));
    ms.position.set(.55,1.33,.15);ms.scale.y=.6;g.add(ms);
    // 台灯
    const lbs=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.03,12),M.metalD);
    lbs.position.set(-.5,1.31,-.35);g.add(lbs);
    const lp=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.45,6),M.metalD);
    lp.position.set(-.5,1.55,-.35);g.add(lp);
    const ls=new THREE.Mesh(new THREE.ConeGeometry(.1,.15,12,1,true),new THREE.MeshStandardMaterial({color:0xf5e6d3,roughness:.7,side:THREE.DoubleSide}));
    ls.position.set(-.5,1.8,-.35);ls.rotation.x=.3;g.add(ls);
    g.position.set(2,0,-4.5);
    g.userData={name:'desk',emoji:'💻',title:'工作经历'};
    scene.add(g);registerInteractive(g);
}

function createChair(){
    const g=new THREE.Group();
    const seat=new THREE.Mesh(new THREE.BoxGeometry(.65,.08,.6),M.leather);
    seat.position.y=.65;seat.castShadow=true;g.add(seat);
    const back=new THREE.Mesh(new THREE.BoxGeometry(.6,.7,.06),M.leather);
    back.position.set(0,1.05,-.27);back.castShadow=true;g.add(back);
    const ag=new THREE.BoxGeometry(.05,.25,.4);
    [[-.32,.88,0],[.32,.88,0]].forEach(p=>{
        const arm=new THREE.Mesh(ag,M.leather);arm.position.set(...p);g.add(arm);
        const ar=new THREE.Mesh(new THREE.BoxGeometry(.07,.03,.35),M.metalD);
        ar.position.set(p[0],1.02,p[2]);g.add(ar);
    });
    for(let i=0;i<5;i++){
        const a=(i/5)*Math.PI*2;
        const leg=new THREE.Mesh(new THREE.BoxGeometry(.04,.4,.4),M.metalD);
        leg.position.set(Math.sin(a)*.25,.2,Math.cos(a)*.25);leg.rotation.y=a;g.add(leg);
        const wh=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.03,8),new THREE.MeshStandardMaterial({color:0x222}));
        wh.rotation.z=Math.PI/2;wh.position.set(Math.sin(a)*.45,.04,Math.cos(a)*.45);g.add(wh);
    }
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,.25,8),M.metal);
    pole.position.y=.5;g.add(pole);
    g.position.set(2,0,-3);
    g.userData={name:'chair',emoji:'�',title:'人体工学椅'};
    scene.add(g);registerInteractive(g);
}

function createBookshelf(){
    const g=new THREE.Group();
    const bb=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.8,.06),M.woodD);
    bb.position.y=4;bb.castShadow=true;g.add(bb);
    for(let i=0;i<4;i++){
        const bd=new THREE.Mesh(new THREE.BoxGeometry(2.1,.04,.35),M.wood);
        bd.position.y=2.8+i*.65;bd.castShadow=true;g.add(bd);
    }
    const sg=new THREE.BoxGeometry(.05,2.8,.35);
    [[-1.075,4,0],[1.075,4,0]].forEach(p=>{
        const s=new THREE.Mesh(sg,M.woodD);s.position.set(...p);g.add(s);
    });
    const bc=[0x6c5ce7,0xcec9,0xe8a87c,0xd63031,0xb894,0xfdcb6e,0xe17055,0x984e3,0xe84393];
    for(let row=0;row<3;row++){
        let x=-.9;
        for(let b=0;b<6;b++){
            const h=.35+Math.random()*.2,w=.07+Math.random()*.05;
            const bm=new THREE.MeshStandardMaterial({color:bc[Math.floor(Math.random()*bc.length)],roughness:.75});
            const bk=new THREE.Mesh(new THREE.BoxGeometry(w,h,.28),bm);
            bk.position.set(x+w/2,2.8+row*.65+h/2+.03,0);bk.castShadow=true;g.add(bk);
            x+=w+.03;if(x>.9)break;
        }
    }
    // 小盆栽
    const pot=new THREE.Mesh(new THREE.CylinderGeometry(.06,.04,.1,8),new THREE.MeshStandardMaterial({color:0xc0392b,roughness:.7}));
    pot.position.set(.7,5.15,0);g.add(pot);
    const lf=new THREE.Mesh(new THREE.SphereGeometry(.08,8,6),new THREE.MeshStandardMaterial({color:0x27ae60,roughness:.8}));
    lf.position.set(.7,5.28,0);lf.scale.y=1.3;g.add(lf);
    g.position.set(-6.85,0,-2);g.rotation.y=Math.PI/2;
    g.userData={name:'bookshelf',emoji:'📚',title:'教育背景'};
    scene.add(g);registerInteractive(g);
}

function createFrames(){
    buildFrame(-6.85,4.2,-4.2,.9,.7,0x6c5ce7,'全家福');
    buildFrame(-6.85,4.2,-3.0,.7,.9,0xe8a87c,'毕业照');
}

function buildFrame(x,y,z,w,h,color,label){
    const f=new THREE.Group();
    f.add(new THREE.Mesh(new THREE.BoxGeometry(w+.1,h+.1,.06),M.frameG));
    f.add(new THREE.Mesh(new THREE.BoxGeometry(w,h,.04),new THREE.MeshStandardMaterial({color:0xfaf0dd,roughness:.8})));
    const photo=new THREE.Mesh(new THREE.BoxGeometry(w*.85,h*.85,.01),new THREE.MeshStandardMaterial({color:color,roughness:.7}));
    photo.position.z=.05;f.add(photo);
    f.position.set(x,y,z);f.rotation.y=Math.PI/2;
    f.userData={name:'frame_'+label,emoji:'🖼️',title:label};
    scene.add(f);registerInteractive(f);
}

function createGuitar(){
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.SphereGeometry(.4,16,12),M.guitarW);
    body.scale.set(1,.35,1.3);body.position.set(0,.15,0);body.castShadow=true;g.add(body);
    const sh=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.02,16),M.guitarD);
    sh.position.set(0,.26,.3);g.add(sh);
    const neck=new THREE.Mesh(new THREE.BoxGeometry(.1,.06,.8),M.guitarD);
    neck.position.set(0,.3,.95);g.add(neck);
    const head=new THREE.Mesh(new THREE.BoxGeometry(.14,.05,.15),M.guitarD);
    head.position.set(0,.33,1.4);g.add(head);
    for(let i=0;i<3;i++){
        const pg=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.04,6),M.metal);
        pg.rotation.x=Math.PI/2;pg.position.set(-.06,.33,1.35+i*.04);g.add(pg);
        const pg2=pg.clone();pg2.position.x=.06;g.add(pg2);
    }
    const brg=new THREE.Mesh(new THREE.BoxGeometry(.15,.02,.04),M.guitarD);
    brg.position.set(0,.27,-.1);g.add(brg);
    g.position.set(-6.3,0,3);g.rotation.y=.3;g.rotation.z=-.08;
    g.userData={name:'guitar',emoji:'�',title:'音乐爱好'};
    scene.add(g);registerInteractive(g);
}

function createSports(){
    const sh=new THREE.Group();
    const shh=new THREE.Mesh(new THREE.SphereGeometry(.06,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xf5f0e8,roughness:.8}));
    sh.add(shh);
    for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2;
        const ft=new THREE.Mesh(new THREE.PlaneGeometry(.02,.12),new THREE.MeshStandardMaterial({color:0xfaf8f0,side:THREE.DoubleSide,roughness:.9}));
        ft.position.set(Math.sin(a)*.03,-.08,Math.cos(a)*.03);ft.rotation.x=.4;ft.rotation.y=a;sh.add(ft);
    }
    sh.position.set(-6.5,2.92,-1.2);
    sh.userData={name:'shuttlecock',emoji:'�',title:'羽毛球'};
    scene.add(sh);registerInteractive(sh);
    const tn=new THREE.Mesh(new THREE.SphereGeometry(.08,12,10),M.tennis);
    const arc=new THREE.Mesh(new THREE.TorusGeometry(.06,.005,4,12,Math.PI),new THREE.MeshStandardMaterial({color:0xfaf8f0}));
    arc.rotation.x=Math.PI/2;arc.position.y=.04;tn.add(arc);
    const arc2=arc.clone();arc2.rotation.y=Math.PI/2;tn.add(arc2);
    tn.position.set(-5.5,.08,4);tn.castShadow=true;
    tn.userData={name:'tennis',emoji:'🎾',title:'网球'};
    scene.add(tn);registerInteractive(tn);
    const rk=new THREE.Group();
    const rf=new THREE.Mesh(new THREE.TorusGeometry(.2,.015,8,24),M.metal);
    rf.rotation.x=Math.PI/2;rk.add(rf);
    for(let i=0;i<5;i++){
        const s1=new THREE.Mesh(new THREE.BoxGeometry(.38,.002,.002),new THREE.MeshStandardMaterial({color:0xddd}));
        s1.position.y=.1-i*.06;rk.add(s1);
        const s2=new THREE.Mesh(new THREE.BoxGeometry(.002,.38,.002),new THREE.MeshStandardMaterial({color:0xddd}));
        s2.position.x=-.12+i*.08;rk.add(s2);
    }
    const hr=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.35,8),M.leather);
    hr.position.y=-.35;rk.add(hr);
    rk.position.set(-6.3,0,4.5);rk.rotation.z=.1;rk.rotation.y=.4;
    rk.userData={name:'racket',emoji:'🏓',title:'球拍'};
    scene.add(rk);registerInteractive(rk);
}

function createWallAwards(){
    buildCert(-3,4.8,-6.9,'互联网+ 全国银奖');
    buildCert(0,5,-6.9,'产品经理大赛 最佳设计奖');
    buildCert(3,4.8,-6.9,'ACM 区域赛铜奖');
}

function buildCert(x,y,z,label){
    const c=new THREE.Group();
    c.add(new THREE.Mesh(new THREE.BoxGeometry(.7,.5,.03),new THREE.MeshStandardMaterial({color:0xfaf0dd,roughness:.8})));
    const bd=new THREE.Mesh(new THREE.BoxGeometry(.74,.54,.025),M.frameG);
    bd.position.z=-.005;c.add(bd);
    const tb=new THREE.Mesh(new THREE.BoxGeometry(.5,.04,.005),new THREE.MeshStandardMaterial({color:0x333}));
    tb.position.y=.08;tb.position.z=.02;c.add(tb);
    const rb=new THREE.Mesh(new THREE.BoxGeometry(.1,.15,.01),M.ribbon);
    rb.position.set(0,-.15,.02);c.add(rb);
    const md=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.008,16),M.goldB);
    md.rotation.x=Math.PI/2;md.position.set(0,-.22,.02);c.add(md);
    const nl=new THREE.Mesh(new THREE.SphereGeometry(.015,8,6),M.metal);
    nl.position.set(0,.27,.02);c.add(nl);
    c.position.set(x,y,z);
    c.userData={name:'cert_'+label,emoji:'🏆',title:label};
    scene.add(c);registerInteractive(c);
}

function createDeskFiles(){
    const fc=[0xfaf8f0,0xf0e8d8,0xe8e0d0,0xf5f0e5];
    const fn=['项目报告.pdf','产品规划.docx','数据分析.xlsx','会议纪要.txt'];
    for(let i=0;i<4;i++){
        const f=new THREE.Group();
        const doc=new THREE.Mesh(new THREE.BoxGeometry(.28,.012,.38),new THREE.MeshStandardMaterial({color:fc[i],roughness:.85}));
        doc.castShadow=true;f.add(doc);
        for(let j=0;j<4;j++){
            const ln=new THREE.Mesh(new THREE.BoxGeometry(.2-j*.02,.002,.008),new THREE.MeshStandardMaterial({color:0x999}));
            ln.position.set(0,.007,-.12+j*.04);f.add(ln);
        }
        const tab=new THREE.Mesh(new THREE.BoxGeometry(.06,.014,.08),new THREE.MeshStandardMaterial({color:0xd4a853}));
        tab.position.set(.08,0,.15);f.add(tab);
        const ox=-.15+i*.08,oz=.3+Math.floor(i/2)*.05;
        f.position.set(2+ox,1.27+(i%2)*.015,-4.5+oz);
        f.rotation.y=(i-1.5)*.05;
        f.userData={name:'file_'+fn[i],emoji:'�',title:fn[i]};
        scene.add(f);registerInteractive(f);
    }
}

function createExtras(){
    const cl=new THREE.Group();
    const cf=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.03,24),new THREE.MeshStandardMaterial({color:0xfaf8f0,roughness:.6}));
    cf.rotation.x=Math.PI/2;cl.add(cf);
    cl.add(new THREE.Mesh(new THREE.TorusGeometry(.2,.015,8,24),M.gold));
    const hh=new THREE.Mesh(new THREE.BoxGeometry(.015,.1,.005),new THREE.MeshStandardMaterial({color:0x222}));
    hh.position.set(.03,.05,.02);cl.add(hh);
    const mh=new THREE.Mesh(new THREE.BoxGeometry(.01,.15,.005),new THREE.MeshStandardMaterial({color:0x222}));
    mh.position.set(0,.07,.025);cl.add(mh);
    cl.position.set(-3,5.5,-6.9);
    cl.userData={name:'clock',emoji:'🕐',title:'墙上时钟'};
    scene.add(cl);registerInteractive(cl);
    const bb=new THREE.Mesh(new THREE.SphereGeometry(.18,16,12),new THREE.MeshStandardMaterial({color:0xd35400,roughness:.7}));
    const bl1=new THREE.Mesh(new THREE.TorusGeometry(.18,.006,4,16),new THREE.MeshStandardMaterial({color:0x2c2c2c}));
    bl1.rotation.x=Math.PI/2;bb.add(bl1);
    const bl2=new THREE.Mesh(new THREE.TorusGeometry(.18,.006,4,16),new THREE.MeshStandardMaterial({color:0x2c2c2c}));
    bl2.rotation.y=Math.PI/2;bb.add(bl2);
    bb.position.set(5.5,.18,3);bb.castShadow=true;
    bb.userData={name:'basketball',emoji:'🏀',title:'篮球'};
    scene.add(bb);registerInteractive(bb);
}

function registerInteractive(group){
    interactiveGroups[group.userData.name]=group;
    group.traverse(child=>{
        if(child.isMesh){
            interactables.push(child);
            child.userData.parentGroup=group.userData.name;
        }
    });
}

function updateCamera(){
    camera.position.set(
        cam.target.x+cam.d*Math.sin(cam.p)*Math.sin(cam.t),
        cam.target.y+cam.d*Math.cos(cam.p),
        cam.target.z+cam.d*Math.sin(cam.p)*Math.cos(cam.t)
    );
    camera.lookAt(cam.target);
}

function focusOn(name){
    const grp=interactiveGroups[name];if(!grp)return;
    const box=new THREE.Box3().setFromObject(grp);
    const ctr=box.getCenter(new THREE.Vector3());
    const sz=box.getSize(new THREE.Vector3);
    animFocus={
        target:ctr.clone(),
        dist:Math.max(sz.x,sz.y,sz.z)*1.8+3,
        fromT:cam.target.clone(),fromD:cam.d,fromTheta:cam.t,fromPhi:cam.p,
        progress:0
    };
}

function updateAnim(){
    if(!animFocus)return;
    animFocus.progress+=.025;
    if(animFocus.progress>=1){animFocus.progress=1;animFocus=null}
    const t=easeOut(animFocus.progress);
    cam.target.lerpVectors(animFocus.fromT,animFocus.target,t);
    cam.d=animFocus.fromD+(animFocus.dist-animFocus.fromD)*t;
    if(animFocus.progress<.01){
        const dir=new THREE.Vector3().subVectors(cam.target,camera.position).normalize();
        animFocus.toTheta=Math.atan2(dir.x,dir.z)+Math.PI*.15;
        animFocus.toPhi=Math.max(.5,Math.min(1.4,Math.acos(Math.max(-1,Math.min(1,dir.y)))));
    }
    cam.t=animFocus.fromTheta+(animFocus.toTheta-animFocus.fromTheta)*t;
    cam.p=animFocus.fromPhi+(animFocus.toPhi-animFocus.fromPhi)*t;
    updateCamera();
}

function easeOut(t){return 1-Math.pow(1-t,3)}

function findGroup(obj){
    let c=obj;
    while(c){
        if(c.userData&&c.userData.name)return c;
        c=c.parent;
    }
    return null;
}

function handleClick(){
    raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects(interactables,false);
    if(hits.length>0){
        const grp=findGroup(hits[0].object);
        if(grp&&grp.userData.name)selectObj(grp.userData.name);
    }
}

function checkHover(){
    raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects(interactables,false);
    const cv=renderer.domElement;
    let found=null;
    if(hits.length>0)found=findGroup(hits[0].object);
    if(found){
        if(hovered!==found){if(hovered)hl(hovered,false);hovered=found;hl(hovered,true)}
        cv.classList.add('pointable');
    }else{
        if(hovered)hl(hovered,false);
        hovered=null;cv.classList.remove('pointable');
    }
}

function hl(group,on){
    const v=on?.15:0;
    group.traverse(child=>{
        if(child.isMesh&&child.material&&child.material.emissive)
            child.material.emissiveIntensity=v+(child.__be||0);
    });
}

function saveBE(){
    Object.values(interactiveGroups).forEach(g=>{
        g.traverse(child=>{
            if(child.isMesh&&child.material&&child.material.emissive)
                child.__be=child.material.emissiveIntensity||0;
        });
    });
}

function selectObj(name){focusOn(name);showPanel(name);highlightNav(name)}

function showPanel(name){
    const data=panelData[name];if(!data)return;
    document.getElementById('panel-emoji').textContent=data.emoji;
    document.getElementById('panel-title').textContent=data.title;
    document.getElementById('panel-content').innerHTML=data.content;
    document.getElementById('info-panel').classList.add('open');
}

function closePanel(){document.getElementById('info-panel').classList.remove('open')}

function buildNav(){
    const nav=document.getElementById('nav-grid');
    [{n:'desk',e:'💻',t:'工作'},{n:'bookshelf',e:'�',t:'教育'},{n:'guitar',e:'🎸',t:'音乐'},{n:'shuttlecock',e:'🏸',t:'羽毛球'},{n:'tennis',e:'🎾',t:'网球'},{n:'cert_互联网+ 全国银奖',e:'🏆',t:'获奖'}].forEach(it=>{
        const b=document.createElement('button');
        b.className='nav-item';b.dataset.name=it.n;
        b.innerHTML='<span class="nav-emoji">'+it.e+'</span><span>'+it.t+'</span>';
        b.addEventListener('click',()=>selectObj(it.n));
        nav.appendChild(b);
    });
}

function highlightNav(name){
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.name===name));
}

function setupEvents(){
    const cv=renderer.domElement;
    cv.addEventListener('mousedown',e=>{isDragging=true;dragStart={x:e.clientX,y:e.clientY}});
    cv.addEventListener('mousemove',e=>{
        mouse.x=(e.clientX/window.innerWidth)*2-1;
        mouse.y=-(e.clientY/window.innerHeight)*2+1;
        if(isDragging&&!animFocus){
            cam.t-=(e.clientX-dragStart.x)*.005;
            cam.p=Math.max(.3,Math.min(1.5,cam.p-(e.clientY-dragStart.y)*.005));
            updateCamera();dragStart={x:e.clientX,y:e.clientY};
        }
    });
    cv.addEventListener('mouseup',e=>{
        if(isDragging&&!animFocus){
            if(Math.abs(e.clientX-dragStart.x)<4&&Math.abs(e.clientY-dragStart.y)<4)handleClick();
        }
        isDragging=false;
    });
    cv.addEventListener('mouseleave',()=>isDragging=false);
    // 滚轮缩放 + 触控板双指旋转
    cv.addEventListener('wheel',e=>{
        e.preventDefault();
        if(e.ctrlKey||e.metaKey){
            // 双指捏合缩放
            cam.d=Math.max(5,Math.min(22,cam.d-e.deltaY*.01));
        }else if(Math.abs(e.deltaX)>Math.abs(e.deltaY)){
            // 双指水平滑动 → 水平旋转
            cam.t-=e.deltaX*.003;
        }else if(Math.abs(e.deltaY)>2){
            // 双指垂直滑动 → 垂直旋转（小deltaY是滚轮缩放）
            cam.p=Math.max(.3,Math.min(1.5,cam.p+e.deltaY*.003));
        }else{
            // 普通滚轮 → 缩放
            cam.d=Math.max(5,Math.min(22,cam.d+e.deltaY*.008));
        }
        updateCamera();
    },{passive:false});
    cv.addEventListener('touchstart',e=>{if(e.touches.length===1){isDragging=true;dragStart={x:e.touches[0].clientX,y:e.touches[0].clientY}}},{passive:true});
    cv.addEventListener('touchmove',e=>{if(isDragging&&e.touches.length===1&&!animFocus){cam.t-=(e.touches[0].clientX-dragStart.x)*.005;cam.p=Math.max(.3,Math.min(1.5,cam.p-(e.touches[0].clientY-dragStart.y)*.005));updateCamera();dragStart={x:e.touches[0].clientX,y:e.touches[0].clientY}}},{passive:true});
    cv.addEventListener('touchend',()=>isDragging=false);
    document.getElementById('panel-close').addEventListener('click',closePanel);
    window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight)});
}

function animate(){
    requestAnimationFrame(animate);
    updateAnim();checkHover();
    const t=clock.getElapsedTime();
    if(M.screen)M.screen.emissiveIntensity=.35+Math.sin(t*1.5)*.08;
    renderer.render(scene,camera);
}

const panelData={
    desk:{emoji:'�',title:'工作经历',content:'<h3>🏢 互联网大厂 · 产品经理</h3><p class="time">2022.06 - 至今</p><p>负责用户增长与体验优化。</p><ul><li>主导智能推荐上线，留存率提升 <span class="hl">23%</span></li><li>用户画像系统覆盖 <span class="hl">500万+</span> 活跃用户</li></ul><div class="divider"></div><h3>🏢 创业公司 · 产品负责人</h3><p class="time">2020.07 - 2022.05</p><ul><li>组建 5 人产品团队</li><li>MVP 获 <span class="hl">1万+</span> 种子用户</li></ul>'},
    chair:{emoji:'🪑',title:'人体工学椅',content:'<h3>久坐伴侣</h3><p>工作再久也要好好对待腰椎。</p><ul><li>五点支撑设计</li><li>可调节高度扶手</li><li>静音万向轮</li></ul>'},
    bookshelf:{emoji:'📚',title:'教育背景',content:'<h3>🎓 硕士研究生 · 计算机科学</h3><p class="time">2018 - 2020</p><ul><li>GPA <span class="hl">3.8/4.0</span></li><li>SCI 论文 2 篇</li><li>国家奖学金</li></ul><div class="divider"></div><h3>🎓 本科 · 软件工程</h3><p class="time">2014 - 2018</p><ul><li>GPA <span class="hl">3.7/4.0</span></li><li>ACM 区域赛铜奖</li></ul>'},
    'frame_全家福':{emoji:'🖼️',title:'全家福',content:'<h3>👨‍👩‍👦 我的家人</h3><p>2023年春节在老家院子里拍的合影。</p>'},
    'frame_毕业照':{emoji:'🎓',title:'毕业照',content:'<h3>� 毕业纪念</h3><p>研究生毕业典礼留影。新旅程的起点。</p>'},
    guitar:{emoji:'🎸',title:'音乐爱好',content:'<h3>🎵 吉他弹唱</h3><p>大学开始学吉他。</p><ul><li>擅长民谣弹唱</li><li>喜欢陈粒、赵雷</li></ul><div class="divider"></div><h3>🎼 音乐品味</h3><p>偏爱独立音乐和电子音乐。</p>'},
    shuttlecock:{emoji:'🏸',title:'羽毛球',content:'<h3>🏸 每周运动</h3><p>坚持最久的球类运动。</p><ul><li>单打双打都擅长</li><li>大学羽毛球队成员</li></ul>'},
    tennis:{emoji:'�',title:'网球',content:'<h3>🎾 优雅运动</h3><p>网球教会我专注和耐心。</p><ul><li>正手进攻型打法</li><li>欣赏费德勒的比赛</li></ul>'},
    racket:{emoji:'�',title:'球拍收藏',content:'<h3>运动装备</h3><ul><li>尤尼克斯 弓10</li><li>Wilson Pro Staff 网球拍</li></ul>'},
    'cert_互联网+ 全国银奖':{emoji:'🏆',title:'互联网+ 全国银奖',content:'<h3>🥇 2023 年</h3><p>中国国际互联网+大学生创新创业大赛 全国银奖。</p><ul><li>项目负责人和路演主讲</li><li>从 <span class="hl">2000+</span> 支队伍中脱颖而出</li></ul>'},
    'cert_产品经理大赛 最佳设计奖':{emoji:'🏆',title:'最佳设计奖',content:'<h3>🥇 2022 年</h3><p>全国产品经理创新大赛 最佳设计奖。</p>'},
    'cert_ACM 区域赛铜奖':{emoji:'🏆',title:'ACM 区域赛铜奖',content:'<h3>🥉 2017 年</h3><p>ACM-ICPC 亚洲区域赛铜奖。</p>'},
    'file_项目报告.pdf':{emoji:'📄',title:'项目报告.pdf',content:'<h3>📋 季度复盘报告</h3><p class="time">2024 Q1</p>'},
    'file_产品规划.docx':{emoji:'📝',title:'产品规划.docx',content:'<h3>�️ 2024 产品路线图</h3><p class="time">2024.01</p>'},
    'file_数据分析.xlsx':{emoji:'📊',title:'数据分析.xlsx',content:'<h3>� 用户行为分析</h3><p class="time">2024.03</p>'},
    'file_会议纪要.txt':{emoji:'📄',title:'会议纪要.txt',content:'<h3>� 周会纪要</h3><p class="time">2024.03.15</p>'},
    clock:{emoji:'🕐',title:'墙上时钟',content:'<h3>⏰ 时间提醒</h3>'},
    basketball:{emoji:'🏀',title:'篮球',content:'<h3>� 篮球场上的回忆</h3><p>大学时期院队成员。</p>'},
};

init();
setTimeout(saveBE,200);
