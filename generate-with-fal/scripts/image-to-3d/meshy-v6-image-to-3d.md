# Meshy v6 Image-to-3D

Generate realistic, production-ready 3D models from images.

## Quick Usage

```bash
bun meshy-v6-image-to-3d.ts --image "https://example.com/object.png"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--image` | string | (required) | Image URL for 3D model creation |
| `--topology` | string | triangle | Mesh topology: quad, triangle |
| `--polycount` | int | 30000 | Target polygon count (100-300000) |
| `--symmetry` | string | auto | Symmetry mode: off, auto, on |
| `--texture` | flag | true | Generate textures |
| `--pbr` | flag | false | Generate PBR maps |
| `--t-pose` | flag | false | Generate in A/T pose |
| `--seed` | int | random | Random seed for reproducibility |
| `--notes` | string | - | Additional notes for journal entry |
| `--json` | flag | - | Output raw JSON response only |
| `--help` | flag | - | Show help message |

## Output

Returns JSON with GLB model and optional thumbnail:
```json
{
  "success": true,
  "glb": "/home/workspace/Generations/260305/xxx-meshy-v6-image-to-3d.glb",
  "thumbnail": "/home/workspace/Generations/260305/xxx-meshy-v6-image-to-3d-thumb.png",
  "seed": 12345,
  "journalPath": "/home/workspace/Generations/.journal/260305/xxx-meshy-v6-image-to-3d.md",
  "durationMs": 45000
}
```

## Examples

Basic conversion:
```bash
bun meshy-v6-image-to-3d.ts --image "character.png"
```

High-poly with PBR:
```bash
bun meshy-v6-image-to-3d.ts --image "sculpture.jpg" --polycount 100000 --pbr
```

Quad topology for smooth surfaces:
```bash
bun meshy-v6-image-to-3d.ts --image "organics.png" --topology quad
```

## Notes

- **Price**: $0.80 per generation
- **Output**: GLB mesh + optional thumbnail
- **Formats**: GLB, FBX, OBJ, USDZ, STL, Blend (available in raw response)
- **Local files**: Supported (auto-converted to base64)
- **PBR**: Generates metallic, roughness, normal maps

## API Reference

- Endpoint: `fal-ai/meshy/v6/image-to-3d`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/meshy/v6/image-to-3d)
- [Full Docs](https://fal.ai/models/fal-ai/meshy/v6/image-to-3d/api)
