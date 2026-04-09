# ReconViaGen 0.5

Generate a textured GLB from one or more images of the same object.

## Quick Usage

```bash
bun reconviagen-0-5.ts --image "object.png"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--image` | string | (required) | Image URL(s) or local path(s); comma-separate multiple views |
| `--resolution` | int | 1024 | Output resolution: 512, 1024, 1536 |
| `--texture-size` | int | 2048 | Texture resolution: 1024, 2048, 4096 |
| `--decimation` | int | 500000 | Target vertex count (5000-2000000) |
| `--ss-source` | enum | mesh | Sparse structure source: direct, mesh, mvtrellis2 |
| `--strategy` | enum | adaptive_guidance_weight | Multi-image merge strategy |
| `--seed` | int | random | Random seed for reproducibility |
| `--notes` | string | - | Additional notes for journal entry |
| `--json` | flag | - | Output raw JSON response only |
| `--help` | flag | - | Show help message |

## Output

Returns JSON with the saved GLB:

```json
{
  "success": true,
  "url": "https://...",
  "glbPath": "/home/workspace/Generations/260407/xxx-reconviagen-0.5-reconviagen.glb",
  "journalPath": "/home/workspace/Generations/.journal/260407/xxx-reconviagen-0.5-reconviagen.md",
  "seed": 12345,
  "durationMs": 30000
}
```

## Examples

Single image:

```bash
bun reconviagen-0-5.ts --image "object.png"
```

Multiple views:

```bash
bun reconviagen-0-5.ts --image "front.png,back.png,left.png" --resolution 1536 --texture-size 4096
```

## Notes

- Price: $0.25 (512), $0.30 (1024), $0.35 (1536)
- Output: textured GLB
- Queue-based: the script polls until the result is ready
- Best results come from clean object-focused views with simple backgrounds

## API Reference

- Endpoint: `fal-ai/reconviagen-0.5`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/reconviagen-0.5)
- [Full Docs](https://fal.ai/models/fal-ai/reconviagen-0.5/api)
