# FLUX.2 Klein 9B

Fast text-to-image generation with FLUX.2 klein 9B from Black Forest Labs.

## Quick Usage

```bash
bun flux-2-klein-9b.ts --prompt "A sunset over mountains"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | The text prompt to generate from |
| `--seed` | int | random | Random seed for reproducibility |
| `--steps` | int | 4 | Number of inference steps (4-8) |
| `--size` | string | landscape_4_3 | Image size preset or custom WxH |
| `--format` | string | png | Output format: png, jpeg, webp |
| `--notes` | string | - | Additional notes for journal entry |
| `--json` | flag | - | Output raw JSON response only |
| `--help` | flag | - | Show help message |

## Size Presets

| Preset | Aspect Ratio |
|--------|--------------|
| `square_hd` | 1:1 (high res) |
| `square` | 1:1 |
| `portrait_4_3` | 4:3 vertical |
| `portrait_16_9` | 16:9 vertical |
| `landscape_4_3` | 4:3 horizontal |
| `landscape_16_9` | 16:9 horizontal |

For custom sizes, use `--width` and `--height` together.

## Examples

Basic generation:
```bash
bun flux-2-klein-9b.ts --prompt "A cyberpunk city at night, neon lights, rain"
```

With specific seed (reproducible):
```bash
bun flux-2-klein-9b.ts --prompt "A cat wearing a hat" --seed 12345
```

Higher quality (more steps):
```bash
bun flux-2-klein-9b.ts --prompt "Portrait of a woman" --steps 8
```

Custom size:
```bash
bun flux-2-klein-9b.ts --prompt "Landscape" --width 1920 --height 1080
```

Square for social media:
```bash
bun flux-2-klein-9b.ts --prompt "Product shot" --size square_hd
```

## Output

Returns JSON:
```json
{
  "success": true,
  "url": "https://v3b.fal.media/files/...",
  "localPath": "/home/workspace/Generations/260305/epvpvhpi-flux-2-klein-9b-sunset-over-mountains.png",
  "journalPath": "/home/workspace/Generations/.journal/260305/epvpvhpi-flux-2-klein-9b-sunset-over-mountains.md",
  "seed": 12345,
  "durationMs": 854
}
```

## Notes

- **Fast**: 4 steps default makes this very quick (~1-2 seconds)
- **Quality**: 8 steps gives better results but ~2x slower
- **Pricing**: $0.006 per megapixel
- **Safety**: Enabled by default; use `--no-safety` to disable
- **num_images**: Always set to 1 (run multiple times for multiple images)

## API Reference

- Endpoint: `fal-ai/flux-2/klein/9b`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2/klein/9b)
- [Full Docs](https://fal.ai/models/fal-ai/flux-2/klein/9b/api)
