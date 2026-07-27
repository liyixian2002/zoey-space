import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

// ========================================
// Office Chair 3D Model - Procedural Generation
// Based on reference images: front, side, back, top, 45° views
// ========================================

let scene, camera, renderer, controls;
let chairGroup;

// Color palette from reference images
const COLORS = {
    fabric: 0x4a4a52,      // Dark gray fabric (seat & backrest)
    fabricDark: 0x3a3a42,   // Slightly darker for edges/shadows
    plastic: 0x33333a,      // Dark plastic (armrests, base)
    plasticLight: 0x3d3d45, // Lighter plastic for highlights
    metal: 0x2a2a30,        // Metal cylinder
    wheel: 0x25252a,        // Wheel casters
    wheelRim: 0x1a1a1f      // Wheel inner rim
};

function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f7);
    scene.fog = new THREE.Fog(0xf5f5f7, 15, 40);

    // Camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(4, 3.5, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 15;
    controls.target.set(0, 1.2, 0);
    controls.maxPolarAngle = Math.PI * 0.85;

    // Lighting - Studio setup for product visualization
    setupLighting();

    // Floor
    createFloor();

    // Chair
    chairGroup = createChair();
    scene.add(chairGroup);

    // Events
    window.addEventListener('resize', onResize);
    document.getElementById('btn-reset').addEventListener('click', resetView);
    document.getElementById('btn-export').addEventListener('click', exportGLB);

    // Hide loading
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 600);

    animate();
}

function setupLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Key light (warm, from upper right)
    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.2);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -6;
    keyLight.shadow.camera.right = 6;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    // Fill light (cool, from left)
    const fillLight = new THREE.DirectionalLight(0xdde8f0, 0.4);
    fillLight.position.set(-4, 5, 2);
    scene.add(fillLight);

    // Rim light (from behind, for edge definition)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // Bottom bounce light
    const bounceLight = new THREE.PointLight(0xf0f0f5, 0.2, 10);
    bounceLight.position.set(0, 0.2, 0);
    scene.add(bounceLight);
}

function createFloor() {
    const geometry = new THREE.CircleGeometry(6, 64);
    const material = new THREE.MeshStandardMaterial({
        color: 0xe8e8ed,
        roughness: 0.9,
        metalness: 0.0
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Subtle grid for scale reference
    const gridHelper = new THREE.GridHelper(12, 24, 0xd0d0d5, 0xe0e0e5);
    gridHelper.position.y = 0.001;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    scene.add(gridHelper);
}

// ========================================
// CHAIR MODEL - Based on reference images
// ========================================

function createChair() {
    const group = new THREE.Group();

    // Materials
    const fabricMat = new THREE.MeshStandardMaterial({
        color: COLORS.fabric,
        roughness: 0.85,
        metalness: 0.0,
        side: THREE.DoubleSide
    });

    const fabricDarkMat = new THREE.MeshStandardMaterial({
        color: COLORS.fabricDark,
        roughness: 0.9,
        metalness: 0.0
    });

    const plasticMat = new THREE.MeshStandardMaterial({
        color: COLORS.plastic,
        roughness: 0.4,
        metalness: 0.1
    });

    const plasticLightMat = new THREE.MeshStandardMaterial({
        color: COLORS.plasticLight,
        roughness: 0.35,
        metalness: 0.15
    });

    const metalMat = new THREE.MeshStandardMaterial({
        color: COLORS.metal,
        roughness: 0.3,
        metalness: 0.6
    });

    const wheelMat = new THREE.MeshStandardMaterial({
        color: COLORS.wheel,
        roughness: 0.7,
        metalness: 0.2
    });

    const wheelRimMat = new THREE.MeshStandardMaterial({
        color: COLORS.wheelRim,
        roughness: 0.5,
        metalness: 0.3
    });

    // ========================================
    // 1. SEAT CUSHION (rounded rectangle, thick)
    // ========================================
    const seatShape = new THREE.Shape();
    const seatW = 0.55, seatD = 0.52, seatR = 0.12;
    seatShape.moveTo(-seatW + seatR, -seatD);
    seatShape.lineTo(seatW - seatR, -seatD);
    seatShape.quadraticCurveTo(seatW, -seatD, seatW, -seatD + seatR);
    seatShape.lineTo(seatW, seatD - seatR);
    seatShape.quadraticCurveTo(seatW, seatD, seatW - seatR, seatD);
    seatShape.lineTo(-seatW + seatR, seatD);
    seatShape.quadraticCurveTo(-seatW, seatD, -seatW, seatD - seatR);
    seatShape.lineTo(-seatW, -seatD + seatR);
    seatShape.quadraticCurveTo(-seatW, -seatD, -seatW + seatR, -seatD);

    const seatExtrudeSettings = {
        steps: 2,
        depth: 0.12,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 6
    };

    const seatGeo = new THREE.ExtrudeGeometry(seatShape, seatExtrudeSettings);
    const seat = new THREE.Mesh(seatGeo, fabricMat);
    seat.rotation.x = -Math.PI / 2;
    seat.position.y = 0.82;
    seat.castShadow = true;
    seat.receiveShadow = true;
    group.add(seat);

    // Seat bottom plate (plastic)
    const seatBottomGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
    const seatBottom = new THREE.Mesh(seatBottomGeo, plasticMat);
    seatBottom.position.y = 0.76;
    seatBottom.castShadow = true;
    group.add(seatBottom);

    // ========================================
    // 2. BACKREST (tall rounded rectangle, slightly curved)
    // ========================================
    const backW = 0.48, backH = 0.62, backR = 0.1;
    const backShape = new THREE.Shape();
    backShape.moveTo(-backW + backR, -backH);
    backShape.lineTo(backW - backR, -backH);
    backShape.quadraticCurveTo(backW, -backH, backW, -backH + backR);
    backShape.lineTo(backW, backH - backR);
    backShape.quadraticCurveTo(backW, backH, backW - backR, backH);
    backShape.lineTo(-backW + backR, backH);
    backShape.quadraticCurveTo(-backW, backH, -backW, backH - backR);
    backShape.lineTo(-backW, -backH + backR);
    backShape.quadraticCurveTo(-backW, -backH, -backW + backR, -backH);

    const backExtrudeSettings = {
        steps: 2,
        depth: 0.08,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.03,
        bevelSegments: 5
    };

    const backGeo = new THREE.ExtrudeGeometry(backShape, backExtrudeSettings);
    const backrest = new THREE.Mesh(backGeo, fabricMat);
    backrest.position.set(0, 0.95, -0.28);
    backrest.rotation.x = -0.12; // Slight recline
    backrest.castShadow = true;
    backrest.receiveShadow = true;
    group.add(backrest);

    // Backrest support bracket (plastic connector)
    const bracketGeo = new THREE.BoxGeometry(0.25, 0.15, 0.06);
    const bracket = new THREE.Mesh(bracketGeo, plasticMat);
    bracket.position.set(0, 0.88, -0.22);
    bracket.rotation.x = -0.12;
    bracket.castShadow = true;
    group.add(bracket);

    // ========================================
    // 3. ARMRESTS (T-shape, curved)
    // ========================================
    function createArmrest(side) {
        const armGroup = new THREE.Group();
        const xOffset = side * 0.58;

        // Vertical support (curved)
        const supportCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(xOffset, 0.82, 0.05),
            new THREE.Vector3(xOffset, 0.88, 0.08),
            new THREE.Vector3(xOffset, 0.92, 0.12),
            new THREE.Vector3(xOffset, 0.95, 0.15)
        ]);
        const supportGeo = new THREE.TubeGeometry(supportCurve, 12, 0.025, 8, false);
        const support = new THREE.Mesh(supportGeo, plasticMat);
        support.castShadow = true;
        armGroup.add(support);

        // Arm pad (rounded top)
        const padShape = new THREE.Shape();
        const padW = 0.12, padD = 0.28, padR = 0.04;
        padShape.moveTo(-padW + padR, -padD);
        padShape.lineTo(padW - padR, -padD);
        padShape.quadraticCurveTo(padW, -padD, padW, -padD + padR);
        padShape.lineTo(padW, padD - padR);
        padShape.quadraticCurveTo(padW, padD, padW - padR, padD);
        padShape.lineTo(-padW + padR, padD);
        padShape.quadraticCurveTo(-padW, padD, -padW, padD - padR);
        padShape.lineTo(-padW, -padD + padR);
        padShape.quadraticCurveTo(-padW, -padD, -padW + padR, -padD);

        const padExtrude = { steps: 1, depth: 0.035, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 4 };
        const padGeo = new THREE.ExtrudeGeometry(padShape, padExtrude);
        const pad = new THREE.Mesh(padGeo, plasticLightMat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(xOffset, 0.97, 0.15);
        pad.castShadow = true;
        armGroup.add(pad);

        // Connection to seat
        const connGeo = new THREE.BoxGeometry(0.04, 0.08, 0.04);
        const conn = new THREE.Mesh(connGeo, plasticMat);
        conn.position.set(xOffset, 0.78, 0.05);
        armGroup.add(conn);

        return armGroup;
    }

    group.add(createArmrest(-1)); // Left
    group.add(createArmrest(1));  // Right

    // ========================================
    // 4. GAS LIFT CYLINDER
    // ========================================
    const cylinderGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 16);
    const cylinder = new THREE.Mesh(cylinderGeo, metalMat);
    cylinder.position.y = 0.42;
    cylinder.castShadow = true;
    group.add(cylinder);

    // Outer cylinder cover
    const coverGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.25, 16);
    const cover = new THREE.Mesh(coverGeo, plasticMat);
    cover.position.y = 0.37;
    cover.castShadow = true;
    group.add(cover);

    // Height adjustment lever
    const leverGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8);
    const lever = new THREE.Mesh(leverGeo, plasticMat);
    lever.position.set(0.15, 0.72, 0.15);
    lever.rotation.z = Math.PI / 2;
    lever.rotation.y = Math.PI / 4;
    group.add(lever);

    const leverKnobGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const leverKnob = new THREE.Mesh(leverKnobGeo, plasticMat);
    leverKnob.position.set(0.22, 0.72, 0.22);
    group.add(leverKnob);

    // ========================================
    // 5. FIVE-STAR BASE
    // ========================================
    const baseGroup = new THREE.Group();

    // Central hub
    const hubGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.06, 16);
    const hub = new THREE.Mesh(hubGeo, plasticMat);
    hub.position.y = 0.2;
    hub.castShadow = true;
    baseGroup.add(hub);

    // Five legs
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const legGroup = new THREE.Group();

        // Main leg arm (tapered)
        const legLength = 0.32;
        const legGeo = new THREE.BoxGeometry(0.045, 0.035, legLength);
        const leg = new THREE.Mesh(legGeo, plasticMat);
        leg.position.z = legLength / 2;
        leg.castShadow = true;
        legGroup.add(leg);

        // Leg tip (slightly wider)
        const tipGeo = new THREE.BoxGeometry(0.05, 0.03, 0.04);
        const tip = new THREE.Mesh(tipGeo, plasticMat);
        tip.position.z = legLength + 0.02;
        legGroup.add(tip);

        legGroup.rotation.y = angle;
        baseGroup.add(legGroup);

        // Wheel at end of each leg
        const wheelGroup = createWheel(wheelMat, wheelRimMat);
        wheelGroup.position.set(
            Math.sin(angle) * (legLength + 0.04),
            0.08,
            Math.cos(angle) * (legLength + 0.04)
        );
        baseGroup.add(wheelGroup);
    }

    group.add(baseGroup);

    // ========================================
    // 6. SEAM DETAILS (subtle edge lines)
    // ========================================
    // Seat edge ring
    const edgeRingGeo = new THREE.TorusGeometry(0.52, 0.008, 8, 48);
    const edgeRing = new THREE.Mesh(edgeRingGeo, fabricDarkMat);
    edgeRing.rotation.x = Math.PI / 2;
    edgeRing.position.y = 0.835;
    edgeRing.scale.set(1.05, 1, 0.95);
    group.add(edgeRing);

    return group;
}

function createWheel(wheelMat, rimMat) {
    const group = new THREE.Group();

    // Wheel housing
    const housingGeo = new THREE.BoxGeometry(0.05, 0.04, 0.04);
    const housing = new THREE.Mesh(housingGeo, wheelMat);
    housing.position.y = 0.12;
    group.add(housing);

    // Fork
    const forkGeo = new THREE.BoxGeometry(0.035, 0.08, 0.025);
    const fork = new THREE.Mesh(forkGeo, wheelMat);
    fork.position.y = 0.07;
    group.add(fork);

    // Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16);
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.y = 0.035;
    wheel.castShadow = true;
    group.add(wheel);

    // Wheel rim detail
    const rimGeo = new THREE.TorusGeometry(0.02, 0.005, 6, 12);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.y = Math.PI / 2;
    rim.position.y = 0.035;
    group.add(rim);

    return group;
}

// ========================================
// EXPORT GLB
// ========================================

function exportGLB() {
    const exporter = new GLTFExporter();

    exporter.parse(
        chairGroup,
        function (gltf) {
            const output = JSON.stringify(gltf);
            const blob = new Blob([output], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'chair.glb';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
        },
        function (error) {
            console.error('Export error:', error);
            alert('Export failed. See console for details.');
        },
        { binary: true }
    );
}

function resetView() {
    camera.position.set(4, 3.5, 5);
    controls.target.set(0, 1.2, 0);
    controls.update();
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();
