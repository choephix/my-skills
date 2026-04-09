# Nano Banana 2

Google's state-of-the-art fast image generation model.

## Quick Usage

```bash
bun nano-banana-2.ts --prompt "A sunset over mountains"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | The text prompt to generate from |
| `--seed` | int | random | Random seed for reproducibility |
| `--aspect` | string | auto | Aspect ratio (see below) |
| `--resolution` | string | 1K | Resolution: 0.5K, 1K, 2K, 4K |
| `--format` | string | png | Output format: png, jpeg, webp |
| `--safety` | string | 4 | Safety tolerance 1-6 (1=strict, 6=lenient) |
| `--web-search` | flag | - | Enable web search for current info |
| `--notes` | string | - | Additional notes for journal entry |
| `--json` | flag | - | Output raw JSON response only |
| `--help` | flag | - | Show help message |

## Aspect Ratios

| Value | Description |
|-------|-------------|
| `auto` | Let model decide based on prompt |
| `21:9` | Ultrawide |
| `16:9` | Widescreen |
| `3:2` | Classic photo |
| `4:3` | Standard |
| `5:4` | Near square |
| `1:1` | Square |
| `4:5` | Portrait standard |
| `3:4` | Portrait |
| `2:3` | Portrait photo |
| `9:16` | Vertical mobile |

## Examples

Basic generation:
```bash
bun nano-banana-2.ts --prompt "A cyberpunk city at night, neon lights, rain"
```

High resolution portrait:
```bash
bun nano-banana-2.ts --prompt "Portrait of a woman" --aspect "3:4" --resolution "2K"
```

With web search (for current events/products):
```bash
bun nano-banana-2.ts --prompt "The latest iPhone on a desk" --web-search
```

Reproducible generation:
```bash
bun nano-banana-2.ts --prompt "A cat wearing a hat" --seed 12345
```

## Output

Returns JSON:
```json
{
  "success": true,
  "url": "https://v3b.fal.media/files/...",
  "localPath": "/home/workspace/Generations/260305/epvpvhpi-nano-banana-2-sunset-over-mountains.png",
  "journalPath": "/home/workspace/Generations/.journal/260305/epvpvhpi-nano-banana-2-sunset-over-mountains.md",
  "seed": 12345,
  "durationMs": 2500
}
```

## Notes

- **Pricing**: $0.08 per image (1K), 1.5x for 2K, 2x for 4K, 0.75x for 0.5K
- **Web search**: Adds $0.015 per request
- **Quality**: State-of-the-art from Google
- **Safety**: Default 4 is balanced; use 6 for lenient, 1 for strict
- **num_images**: Always set to 1 (run multiple times for multiple images)

## API Reference

- Endpoint: `fal-ai/nano-banana-2`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/nano-banana-2)
- [Full Docs](https://fal.ai/models/fal-ai/nano-banana-2/api)
