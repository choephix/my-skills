# Meshy v6 Text-to-3D

Generate realistic, production-ready 3D models from text descriptions.

## Quick Usage

```bash
bun meshy-v6-text-to-3d.ts --prompt "A rustic wooden treasure chest"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Description of the 3D model (max 600 chars) |
| `--mode` | string | full | Generation mode: preview, full |
| `--art-style` | string | realistic | Art style: realistic, sculpture |
| `--topology` | string | triangle | Mesh topology: quad, triangle |
| `--polycount` | int | 30000 | Target polygon count (100-300000) |
| `--symmetry` | string | auto | Symmetry mode: off, auto, on |
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
  "glb": "/home/workspace/Generations/260305/xxx-meshy-v6-text-to-3d-treasure-chest.glb",
  "thumbnail": "/home/workspace/Generations/260305/xxx-meshy-v6-text-to-3d-treasure-chest-thumb.png",
  "seed": 12345,
  "journalPath": "/home/workspace/Generations/.journal/260305/xxx-meshy-v6-text-to-3d-treasure-chest.md",
  "durationMs": 45000
}
```

## Examples

Basic generation:
```bash
bun meshy-v6-text-to-3d.ts --prompt "A medieval sword with ornate hilt"
```

Sculpture style:
```bash
bun meshy-v6-text-to-3d.ts --prompt "Greek statue" --art-style sculpture
```

High-poly for detailed models:
```bash
bun meshy-v6-text-to-3d.ts --prompt "Detailed dragon" --polycount 100000
```

Preview mode (faster, no texture):
```bash
bun meshy-v6-text-to-3d.ts --prompt "Simple cube" --mode preview
```

## Notes

- **Price**: $0.80 per generation
- **Output**: GLB mesh + optional thumbnail
- **Formats**: GLB, FBX, OBJ, USDZ, STL, Blend (available in raw response)
- **Preview mode**: Returns untextured geometry only (faster)
- **Full mode**: Returns textured model with materials

## API Reference

- Endpoint: `fal-ai/meshy/v6/text-to-3d`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/meshy/v6/text-to-3d)
- [Full Docs](https://fal.ai/models/fal-ai/meshy/v6/text-to-3d/api)
