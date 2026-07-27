# Textures Folder

This folder is reserved for texture assets. The current chair model uses procedural PBR materials (defined via material properties like roughness, metallic, base color) without external texture files.

## Material Reference

| Part | Base Color | Roughness | Metallic |
|------|-----------|-----------|----------|
| Fabric (seat & backrest) | #4a4a52 | 0.85 | 0.0 |
| Fabric Dark (seams) | #3a3a42 | 0.90 | 0.0 |
| Plastic (armrests, base) | #33333a | 0.40 | 0.1 |
| Plastic Light (arm pads) | #3d3d45 | 0.35 | 0.15 |
| Metal (gas cylinder) | #2a2a30 | 0.30 | 0.6 |
| Wheel | #25252a | 0.70 | 0.2 |
| Wheel Rim | #1a1a1f | 0.50 | 0.3 |

## To Add Textures

1. Import `chair.glb` into Blender
2. UV unwrap each mesh part
3. Create/fabricate textures (diffuse, normal, roughness, metallic)
4. Export as textured GLB from Blender
