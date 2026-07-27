/**
 * Chair GLB Generator
 * Uses Three.js + GLTFExporter to generate a standalone .glb file
 * Run: node generate-glb.js
 */

const fs = require('fs');
const path = require('path');

// We need to use Three.js in Node.js environment
// Install dependencies first: npm install three

let THREE, GLTFExporter;

try {
    THREE = require('three');
    GLTFExporter = require('three/examples/jsm/exporters/GLTFExporter.js').GLTFExporter;
} catch (e) {
    console.error('Please install three first: npm install three');
    process.exit(1);
}

// Color palette from reference images
const COLORS = {
    fabric: 0x4a4a52,
    fabricDark: 0x3a3a42,
    plastic: 0x33333a,
    plasticLight: 0x3d3d45,
    metal: 0x2a2a30,
    wheel: 0x25252a,
    wheelRim: 0x1a1a1f
};

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

    // 1. SEAT CUSHION
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
    group.add(seat);

    // Seat bottom plate
    const seatBottomGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 32);
    const seatBottom = new THREE.Mesh(seatBottomGeo, plasticMat);
    seatBottom.position.y = 0.76;
    group.add(seatBottom);

    // 2. BACKREST
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
    backrest.rotation.x = -0.12;
    backrest.castShadow = true;
    group.add(backrest);

    // Backrest bracket
    const bracketGeo = new THREE.BoxGeometry(0.25, 0.15, 0.06);
    const bracket = new THREE.Mesh(bracketGeo, plasticMat);
    bracket.position.set(0, 0.88, -0.22);
    bracket.rotation.x = -0.12;
    group.add(bracket);

    // 3. ARMRESTS
    function createArmrest(side) {
        const armGroup = new THREE.Group();
        const xOffset = side * 0.58;

        // Vertical support
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

        // Arm pad
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

        const padExtrude = {
            steps: 1, depth: 0.035,
            bevelEnabled: true, bevelThickness: 0.015,
            bevelSize: 0.015, bevelSegments: 4
        };
        const padGeo = new THREE.ExtrudeGeometry(padShape, padExtrude);
        const pad = new THREE.Mesh(padGeo, plasticLightMat);
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(xOffset, 0.97, 0.15);
        pad.castShadow = true;
        armGroup.add(pad);

        // Connection
        const connGeo = new THREE.BoxGeometry(0.04, 0.08, 0.04);
        const conn = new THREE.Mesh(connGeo, plasticMat);
        conn.position.set(xOffset, 0.78, 0.05);
        armGroup.add(conn);

        return armGroup;
    }

    group.add(createArmrest(-1));
    group.add(createArmrest(1));

    // 4. GAS LIFT
    const cylinderGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.35, 16);
    const cylinder = new THREE.Mesh(cylinderGeo, metalMat);
    cylinder.position.y = 0.42;
    group.add(cylinder);

    const coverGeo = new THREE.CylinderGeometry(0.045, 0.05, 0.25, 16);
    const cover = new THREE.Mesh(coverGeo, plasticMat);
    cover.position.y = 0.37;
    group.add(cover);

    // Height lever
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

    // 5. FIVE-STAR BASE
    const baseGroup = new THREE.Group();

    const hubGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.06, 16);
    const hub = new THREE.Mesh(hubGeo, plasticMat);
    hub.position.y = 0.2;
    baseGroup.add(hub);

    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const legGroup = new THREE.Group();

        const legLength = 0.32;
        const legGeo = new THREE.BoxGeometry(0.045, 0.035, legLength);
        const leg = new THREE.Mesh(legGeo, plasticMat);
        leg.position.z = legLength / 2;
        legGroup.add(leg);

        const tipGeo = new THREE.BoxGeometry(0.05, 0.03, 0.04);
        const tip = new THREE.Mesh(tipGeo, plasticMat);
        tip.position.z = legLength + 0.02;
        legGroup.add(tip);

        legGroup.rotation.y = angle;
        baseGroup.add(legGroup);

        // Wheel
        const wheelGroup = new THREE.Group();

        const housingGeo = new THREE.BoxGeometry(0.05, 0.04, 0.04);
        const housing = new THREE.Mesh(housingGeo, wheelMat);
        housing.position.y = 0.12;
        wheelGroup.add(housing);

        const forkGeo = new THREE.BoxGeometry(0.035, 0.08, 0.025);
        const fork = new THREE.Mesh(forkGeo, wheelMat);
        fork.position.y = 0.07;
        wheelGroup.add(fork);

        const wheelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.025, 16);
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.y = 0.035;
        wheelGroup.add(wheel);

        const rimGeo = new THREE.TorusGeometry(0.02, 0.005, 6, 12);
        const rim = new THREE.Mesh(rimGeo, wheelRimMat);
        rim.rotation.y = Math.PI / 2;
        rim.position.y = 0.035;
        wheelGroup.add(rim);

        wheelGroup.position.set(
            Math.sin(angle) * (legLength + 0.04),
            0.08,
            Math.cos(angle) * (legLength + 0.04)
        );
        baseGroup.add(wheelGroup);
    }

    group.add(baseGroup);

    // 6. SEAM DETAIL
    const edgeRingGeo = new THREE.TorusGeometry(0.52, 0.008, 8, 48);
    const edgeRing = new THREE.Mesh(edgeRingGeo, fabricDarkMat);
    edgeRing.rotation.x = Math.PI / 2;
    edgeRing.position.y = 0.835;
    edgeRing.scale.set(1.05, 1, 0.95);
    group.add(edgeRing);

    return group;
}

// Generate and export
console.log('Generating chair model...');
const chair = createChair();

const exporter = new GLTFExporter();

exporter.parse(
    chair,
    function (gltf) {
        const output = JSON.stringify(gltf);
        const buffer = Buffer.from(output);
        fs.writeFileSync(path.join(__dirname, 'chair.glb'), buffer);
        console.log('✅ chair.glb exported successfully!');
        console.log(`   Size: ${(buffer.length / 1024).toFixed(1)} KB`);
    },
    function (error) {
        console.error('Export failed:', error);
    },
    { binary: true }
);
