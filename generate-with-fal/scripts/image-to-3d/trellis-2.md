# Trellis 2

Generate high-quality 3D models from images using native 3D generative model.

## Quick Usage

```bash
bun trellis-2.ts --image "https://example.com/object.png"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--image` | string | (required) | Image URL to convert to 3D |
| `--resolution` | int | 1024 | Output resolution: 512, 1024, 1536 |
| `--texture-size` | int | 2048 | Texture resolution: 1024, 2048, 4096 |
| `--decimation` | int | 500000 | Target vertex count (5000-2000000) |
| `--remesh` | flag | true | Rebuild mesh topology |
| `--seed` | int | random | Random seed for reproducibility |
| `--notes` | string | - | Additional notes for journal entry |
| `--json` | flag | - | Output raw JSON response only |
| `--help` | flag | - | Show help message |

## Output

Returns JSON with GLB model:
```json
{
  "success": true,
  "glb": "/home/workspace/Generations/260305/xxx-trellis-2.glb",
  "journalPath": "/home/workspace/Generations/.journal/260305/xxx-trellis-2.md",
  "durationMs": 30000
}
```

## Examples

Basic conversion:
```bash
bun trellis-2.ts --image "character.png"
```

High resolution:
```bash
bun trellis-2.ts --image "detailed-object.jpg" --resolution 1536 --texture-size 4096
```

Low-poly for web/mobile:
```bash
bun trellis-2.ts --image "game-asset.png" --decimation 20000
```

## Notes

- **Price**: $0.25 (512p), $0.30 (1024p), $0.35 (1536p)
- **Output**: GLB mesh with baked textures
- **Local files**: Supported (auto-converted to base64)
- **Decimation**: 500k vertices good for most uses, 20k-50k for web/mobile
- **Remesh**: Cleaner topology but slower

## API Reference

- Endpoint: `fal-ai/trellis-2`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/trellis-2)
- [Full Docs](https://fal.ai/models/fal-ai/trellis-2/api)
