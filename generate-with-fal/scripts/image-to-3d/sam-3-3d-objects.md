# SAM 3 3D Objects

Precise 3D reconstruction of objects from real images with accurate geometry and texture.

## Quick Usage

```bash
bun sam-3-3d-objects.ts --image "https://example.com/car.jpg"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--image` | string | (required) | Image URL to reconstruct in 3D |
| `--prompt` | string | "car" | Text prompt for auto-segmentation |
| `--masks` | string | - | Comma-separated mask URLs |
| `--textured-glb` | flag | false | Export GLB with baked texture and UVs |
| `--seed` | int | random | Random seed for reproducibility |
| `--notes` | string | - | Additional notes for journal entry |
| `--json` | flag | - | Output raw JSON response only |
| `--help` | flag | - | Show help message |

## Output

Returns JSON with GLB and Gaussian Splat files:
```json
{
  "success": true,
  "glb": "/home/workspace/Generations/260305/xxx-sam-3-3d-objects-car.glb",
  "splat": "/home/workspace/Generations/260305/xxx-sam-3-3d-objects-car.ply",
  "journalPath": "/home/workspace/Generations/.journal/260305/xxx-sam-3-3d-objects-car.md",
  "durationMs": 15000
}
```

## Examples

Basic reconstruction:
```bash
bun sam-3-3d-objects.ts --image "https://example.com/car.jpg"
```

With segmentation prompt:
```bash
bun sam-3-3d-objects.ts --image "room.png" --prompt "chair"
```

With textured GLB output:
```bash
bun sam-3-3d-objects.ts --image "object.jpg" --textured-glb
```

## Notes

- **Price**: $0.02 per generation
- **Output**: Gaussian Splat (.ply) + optional GLB mesh
- **Segmentation**: Use prompt or provide mask URLs for multi-object scenes
- **Local files**: Supported (auto-converted to base64)

## API Reference

- Endpoint: `fal-ai/sam-3/3d-objects`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/sam-3/3d-objects)
- [Full Docs](https://fal.ai/models/fal-ai/sam-3/3d-objects/api)
