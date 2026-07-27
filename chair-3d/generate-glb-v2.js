/**
 * Chair GLB Generator v2
 * Uses @gltf-transform/core for Node.js binary GLB export
 * Run: node generate-glb-v2.js
 */

const fs = require('fs');
const path = require('path');

const { Document, NodeIO } = require('@gltf-transform/core');
const { KHRDracoMeshCompression } = require('@gltf-transform/extensions');

// Color palette from reference images
const COLORS = {
    fabric: [0.29, 0.29, 0.32, 1.0],
    fabricDark: [0.23, 0.23, 0.26, 1.0],
    plastic: [0.20, 0.20, 0.23, 1.0],
    plasticLight: [0.24, 0.24, 0.27, 1.0],
    metal: [0.16, 0.16, 0.19, 1.0],
    wheel: [0.15, 0.15, 0.16, 1.0],
    wheelRim: [0.10, 0.10, 0.12, 1.0]
};

function createRoundedRectShape(w, h, r) {
    const shape = [];
    const segments = 16;

    // Bottom edge
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI / 2;
        shape.push([w - r + Math.cos(t + Math.PI * 1.5) * r, -h + r + Math.sin(t + Math.PI * 1.5) * r]);
    }
    // Right edge
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI / 2;
        shape.push([w - r + Math.cos(t) * r, h - r + Math.sin(t) * r]);
    }
    // Top edge
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI / 2;
        shape.push([-w + r + Math.cos(t + Math.PI * 0.5) * r, h - r + Math.sin(t + Math.PI * 0.5) * r]);
    }
    // Left edge
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI / 2;
        shape.push([-w + r + Math.cos(t + Math.PI) * r, -h + r + Math.sin(t + Math.PI) * r]);
    }

    return shape;
}

function triangulatePolygon(vertices) {
    // Simple fan triangulation for convex polygons
    const indices = [];
    for (let i = 1; i < vertices.length - 1; i++) {
        indices.push(0, i, i + 1);
    }
    return indices;
}

function extrudeShape(shape, depth, bevel) {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Front face
    const frontCenter = [0, 0, depth / 2];
    const frontVerts = shape.map(([x, y]) => [x, y, depth / 2]);
    const frontIndices = triangulatePolygon(frontVerts);

    frontVerts.forEach(v => { vertices.push(...v); normals.push(0, 0, 1); });
    frontIndices.forEach(i => indices.push(i));

    // Back face
    const backVerts = shape.map(([x, y]) => [x, y, -depth / 2]);
    const backIndices = triangulatePolygon(backVerts.reverse());
    const backOffset = vertices.length / 3;

    backVerts.forEach(v => { vertices.push(...v); normals.push(0, 0, -1); });
    backIndices.forEach(i => indices.push(i + backOffset));

    // Side walls
    const wallOffset = vertices.length / 3;
    for (let i = 0; i < shape.length; i++) {
        const j = (i + 1) % shape.length;
        const p1 = shape[i];
        const p2 = shape[j];

        const dx = p2[0] - p1[0];
        const dy = p2[1] - p1[1];
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len;
        const ny = dx / len;

        // Four vertices for this wall segment (front and back)
        vertices.push(p1[0], p1[1], depth / 2, p2[0], p2[1], depth / 2,
                      p2[0], p2[1], -depth / 2, p1[0], p1[1], -depth / 2);
        normals.push(nx, ny, 0, nx, ny, 0, nx, ny, 0, nx, ny, 0);

        const base = wallOffset + i * 4;
        indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }

    return { vertices, normals, indices };
}

function createBox(w, h, d) {
    const hw = w / 2, hh = h / 2, hd = d / 2;
    return {
        vertices: [
            -hw, -hh, -hd,  hw, -hh, -hd,  hw,  hh, -hd, -hw,  hh, -hd,  // back
            -hw, -hh,  hd,  hw, -hh,  hd,  hw,  hh,  hd, -hw,  hh,  hd,  // front
            -hw,  hh, -hd,  hw,  hh, -hd,  hw,  hh,  hd, -hw,  hh,  hd,  // top
            -hw, -hh, -hd,  hw, -hh, -hd,  hw, -hh,  hd, -hw, -hh,  hd,  // bottom
            -hw, -hh, -hd, -hw,  hh, -hd, -hw,  hh,  hd, -hw, -hh,  hd,  // left
             hw, -hh, -hd,  hw,  hh, -hd,  hw,  hh,  hd,  hw, -hh,  hd   // right
        ],
        normals: [
             0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
             0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
             0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
             0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
            -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0,
             1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0
        ],
        indices: [
            0, 2, 1, 0, 3, 2,       // back
            4, 5, 6, 4, 6, 7,       // front
            8, 9, 10, 8, 10, 11,    // top
            12, 15, 14, 12, 14, 13, // bottom
            16, 17, 18, 16, 18, 19, // left
            20, 23, 22, 20, 22, 21  // right
        ]
    };
}

function createCylinder(radius, height, segments = 16) {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Top and bottom centers
    vertices.push(0, height / 2, 0, 0, -height / 2, 0);
    normals.push(0, 1, 0, 0, -1, 0);

    // Rim vertices
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        vertices.push(x, height / 2, z, x, -height / 2, z);
        normals.push(x / radius, 0, z / radius, x / radius, 0, z / radius);
    }

    // Top face
    for (let i = 0; i < segments; i++) {
        indices.push(0, 2 + i * 2, 2 + (i + 1) * 2);
    }

    // Bottom face
    for (let i = 0; i < segments; i++) {
        indices.push(1, 3 + (i + 1) * 2, 3 + i * 2);
    }

    // Side faces
    for (let i = 0; i < segments; i++) {
        const base = 2 + i * 2;
        indices.push(base, base + 1, base + 3, base, base + 3, base + 2);
    }

    return { vertices, normals, indices };
}

function createTorus(majorR, minorR, majorSeg = 24, minorSeg = 12) {
    const vertices = [];
    const normals = [];
    const indices = [];

    for (let i = 0; i <= majorSeg; i++) {
        const u = (i / majorSeg) * Math.PI * 2;
        for (let j = 0; j <= minorSeg; j++) {
            const v = (j / minorSeg) * Math.PI * 2;

            const x = (majorR + minorR * Math.cos(v)) * Math.cos(u);
            const y = minorR * Math.sin(v);
            const z = (majorR + minorR * Math.cos(v)) * Math.sin(u);

            vertices.push(x, y, z);

            const nx = Math.cos(v) * Math.cos(u);
            const ny = Math.sin(v);
            const nz = Math.cos(v) * Math.sin(u);
            normals.push(nx, ny, nz);
        }
    }

    for (let i = 0; i < majorSeg; i++) {
        for (let j = 0; j < minorSeg; j++) {
            const a = i * (minorSeg + 1) + j;
            const b = a + minorSeg + 1;
            indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
    }

    return { vertices, normals, indices };
}

function createSphere(radius, wSeg = 16, hSeg = 12) {
    const vertices = [];
    const normals = [];
    const indices = [];

    for (let i = 0; i <= hSeg; i++) {
        const theta = (i / hSeg) * Math.PI;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let j = 0; j <= wSeg; j++) {
            const phi = (j / wSeg) * Math.PI * 2;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta * radius;
            const y = cosTheta * radius;
            const z = sinPhi * sinTheta * radius;

            vertices.push(x, y, z);
            normals.push(x / radius, y / radius, z / radius);
        }
    }

    for (let i = 0; i < hSeg; i++) {
        for (let j = 0; j < wSeg; j++) {
            const a = i * (wSeg + 1) + j;
            const b = a + wSeg + 1;
            indices.push(a, b, a + 1, b, b + 1, a + 1);
        }
    }

    return { vertices, normals, indices };
}

function mergeMeshes(meshes) {
    let vertices = [];
    let normals = [];
    let indices = [];
    let offset = 0;

    meshes.forEach(mesh => {
        vertices.push(...mesh.vertices);
        normals.push(...mesh.normals);
        indices.push(...mesh.indices.map(i => i + offset));
        offset += mesh.vertices.length / 3;
    });

    return { vertices, normals, indices };
}

function transformMesh(mesh, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    const verts = [];
    const norms = [];

    sx = sx || 1; sy = sy || 1; sz = sz || 1;
    rx = rx || 0; ry = ry || 0; rz = rz || 0;

    const cx = Math.cos(rx), sx_ = Math.sin(rx);
    const cy = Math.cos(ry), sy_ = Math.sin(ry);
    const cz = Math.cos(rz), sz_ = Math.sin(rz);

    for (let i = 0; i < mesh.vertices.length; i += 3) {
        let x = mesh.vertices[i] * sx;
        let y = mesh.vertices[i + 1] * sy;
        let z = mesh.vertices[i + 2] * sz;

        // Rotate X
        let y1 = y * cx - z * sx_;
        let z1 = y * sx_ + z * cx;
        y = y1; z = z1;

        // Rotate Y
        let x1 = x * cy + z * sy_;
        let z2 = -x * sy_ + z * cy;
        x = x1; z = z2;

        // Rotate Z
        let x2 = x * cz - y * sz_;
        let y2 = x * sz_ + y * cz;
        x = x2; y = y2;

        verts.push(x + tx, y + ty, z + tz);
    }

    for (let i = 0; i < mesh.normals.length; i += 3) {
        let x = mesh.normals[i];
        let y = mesh.normals[i + 1];
        let z = mesh.normals[i + 2];

        let y1 = y * cx - z * sx_;
        let z1 = y * sx_ + z * cx;
        y = y1; z = z1;

        let x1 = x * cy + z * sy_;
        let z2 = -x * sy_ + z * cy;
        x = x1; z = z2;

        let x2 = x * cz - y * sz_;
        let y2 = x * sz_ + y * cz;
        x = x2; y = y2;

        norms.push(x, y, z);
    }

    return { vertices: verts, normals: norms, indices: mesh.indices };
}

// ========================================
// BUILD CHAIR
// ========================================

console.log('Building chair geometry...');

const allMeshes = [];

// 1. SEAT
const seatShape = createRoundedRectShape(0.55, 0.52, 0.12);
const seatMesh = extrudeShape(seatShape, 0.12, true);
allMeshes.push({ mesh: transformMesh(seatMesh, 0, 0.88, 0, -Math.PI / 2, 0, 0), mat: 'fabric' });

// Seat bottom plate
const seatBottom = createCylinder(0.35, 0.04, 32);
allMeshes.push({ mesh: transformMesh(seatBottom, 0, 0.76, 0), mat: 'plastic' });

// 2. BACKREST
const backShape = createRoundedRectShape(0.48, 0.62, 0.1);
const backMesh = extrudeShape(backShape, 0.08, true);
allMeshes.push({ mesh: transformMesh(backMesh, 0, 1.57, -0.28, -0.12, 0, 0), mat: 'fabric' });

// Backrest bracket
const bracket = createBox(0.25, 0.15, 0.06);
allMeshes.push({ mesh: transformMesh(bracket, 0, 0.88, -0.22, -0.12, 0, 0), mat: 'plastic' });

// 3. ARMRESTS
function createArmrestMesh(side) {
    const meshes = [];
    const xOff = side * 0.58;

    // Support (simplified as angled box)
    const support = createBox(0.05, 0.15, 0.05);
    meshes.push({ mesh: transformMesh(support, xOff, 0.89, 0.1, 0.15, 0, side * 0.1), mat: 'plastic' });

    // Arm pad
    const padShape = createRoundedRectShape(0.12, 0.28, 0.04);
    const padMesh = extrudeShape(padShape, 0.035, true);
    meshes.push({ mesh: transformMesh(padMesh, xOff, 0.985, 0.15, -Math.PI / 2, 0, 0), mat: 'plasticLight' });

    // Connection
    const conn = createBox(0.04, 0.08, 0.04);
    meshes.push({ mesh: transformMesh(conn, xOff, 0.78, 0.05), mat: 'plastic' });

    return meshes;
}

allMeshes.push(...createArmrestMesh(-1));
allMeshes.push(...createArmrestMesh(1));

// 4. GAS LIFT
const cylinder = createCylinder(0.035, 0.35, 16);
allMeshes.push({ mesh: transformMesh(cylinder, 0, 0.42, 0), mat: 'metal' });

const cover = createCylinder(0.045, 0.25, 16);
allMeshes.push({ mesh: transformMesh(cover, 0, 0.37, 0), mat: 'plastic' });

// Height lever
const lever = createCylinder(0.012, 0.15, 8);
allMeshes.push({ mesh: transformMesh(lever, 0.15, 0.72, 0.15, 0, Math.PI / 4, Math.PI / 2), mat: 'plastic' });

const leverKnob = createSphere(0.02, 8, 8);
allMeshes.push({ mesh: transformMesh(leverKnob, 0.22, 0.72, 0.22), mat: 'plastic' });

// 5. FIVE-STAR BASE
const hub = createCylinder(0.06, 0.06, 16);
allMeshes.push({ mesh: transformMesh(hub, 0, 0.2, 0), mat: 'plastic' });

for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const leg = createBox(0.045, 0.035, 0.32);
    allMeshes.push({
        mesh: transformMesh(leg, Math.sin(angle) * 0.16, 0.2, Math.cos(angle) * 0.16, 0, angle, 0),
        mat: 'plastic'
    });

    const tip = createBox(0.05, 0.03, 0.04);
    allMeshes.push({
        mesh: transformMesh(tip, Math.sin(angle) * 0.34, 0.2, Math.cos(angle) * 0.34, 0, angle, 0),
        mat: 'plastic'
    });

    // Wheel housing
    const housing = createBox(0.05, 0.04, 0.04);
    allMeshes.push({
        mesh: transformMesh(housing, Math.sin(angle) * 0.36, 0.12, Math.cos(angle) * 0.36, 0, angle, 0),
        mat: 'wheel'
    });

    // Wheel
    const wheel = createCylinder(0.035, 0.025, 16);
    allMeshes.push({
        mesh: transformMesh(wheel, Math.sin(angle) * 0.36, 0.035, Math.cos(angle) * 0.36, Math.PI / 2, angle, 0),
        mat: 'wheel'
    });

    // Wheel rim
    const rim = createTorus(0.02, 0.005, 12, 6);
    allMeshes.push({
        mesh: transformMesh(rim, Math.sin(angle) * 0.36, 0.035, Math.cos(angle) * 0.36, Math.PI / 2, angle, 0),
        mat: 'wheelRim'
    });
}

// 6. SEAM DETAIL
const edgeRing = createTorus(0.52, 0.008, 48, 8);
allMeshes.push({ mesh: transformMesh(edgeRing, 0, 0.835, 0, Math.PI / 2, 0, 0, 1.05, 1, 0.95), mat: 'fabricDark' });

// ========================================
// BUILD GLTF DOCUMENT
// ========================================

console.log('Creating GLTF document...');

const doc = new Document();

// Create materials
const materials = {};
const matDefs = {
    fabric: { baseColor: COLORS.fabric, roughness: 0.85, metallic: 0.0 },
    fabricDark: { baseColor: COLORS.fabricDark, roughness: 0.9, metallic: 0.0 },
    plastic: { baseColor: COLORS.plastic, roughness: 0.4, metallic: 0.1 },
    plasticLight: { baseColor: COLORS.plasticLight, roughness: 0.35, metallic: 0.15 },
    metal: { baseColor: COLORS.metal, roughness: 0.3, metallic: 0.6 },
    wheel: { baseColor: COLORS.wheel, roughness: 0.7, metallic: 0.2 },
    wheelRim: { baseColor: COLORS.wheelRim, roughness: 0.5, metallic: 0.3 }
};

for (const [name, def] of Object.entries(matDefs)) {
    const mat = doc.createMaterial(name)
        .setBaseColorFactor(def.baseColor)
        .setRoughnessFactor(def.roughness)
        .setMetallicFactor(def.metallic);
    materials[name] = mat;
}

// Create accessor/buffer
const buffer = doc.createBuffer();

// Group by material
const byMaterial = {};
allMeshes.forEach(({ mesh, mat }) => {
    if (!byMaterial[mat]) byMaterial[mat] = [];
    byMaterial[mat].push(mesh);
});

const scene = doc.createScene('ChairScene');
const rootNode = doc.createNode('Chair').setTranslation([0, 0, 0]);
scene.addChild(rootNode);

for (const [matName, meshes] of Object.entries(byMaterial)) {
    const merged = mergeMeshes(meshes);

    const vertCount = merged.vertices.length / 3;

    const posAccessor = doc.createAccessor()
        .setType('VEC3')
        .setBuffer(buffer)
        .setArray(new Float32Array(merged.vertices));

    const normAccessor = doc.createAccessor()
        .setType('VEC3')
        .setBuffer(buffer)
        .setArray(new Float32Array(merged.normals));

    const idxAccessor = doc.createAccessor()
        .setType('SCALAR')
        .setBuffer(buffer)
        .setArray(new Uint16Array(merged.indices));

    const prim = doc.createPrimitive()
        .setAttribute('POSITION', posAccessor)
        .setAttribute('NORMAL', normAccessor)
        .setIndices(idxAccessor)
        .setMaterial(materials[matName]);

    const mesh = doc.createMesh(`${matName}_mesh`).addPrimitive(prim);
    const node = doc.createNode(`${matName}_part`).setMesh(mesh);
    rootNode.addChild(node);
}

// Write GLB
async function main() {
    const io = new NodeIO();
    const glb = await io.writeBinary(doc);

    fs.writeFileSync(path.join(__dirname, 'chair.glb'), Buffer.from(glb));
    console.log('✅ chair.glb exported successfully!');
    console.log(`   Size: ${(glb.byteLength / 1024).toFixed(1)} KB`);
}

main().catch(err => {
    console.error('Export failed:', err);
    process.exit(1);
});
