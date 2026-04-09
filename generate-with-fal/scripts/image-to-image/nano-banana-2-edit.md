# Nano Banana 2 Edit

Google's state-of-the-art image editing model.

## Quick Usage

```bash
bun nano-banana-2-edit.ts --prompt "Add a sunset" --image "https://example.com/photo.png"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | The text prompt to edit the image |
| `--image` | string | (required) | Image URL(s) to edit (comma-separated) |
| `--seed` | int | random | Random seed for reproducibility |
| `--aspect` | string | auto | Aspect ratio (see below) |
| `--resolution` | string | 1K | Resolution: 0.5K, 1K, 2K, 4K |
| `--format` | string | png | Output format: png, jpeg, webp |
| `--safety` | string | 4 | Safety tolerance 1-6 |
| `--web-search` | flag | - | Enable web search for up-to-date info |
| `--notes` | string | - | Additional notes for journal entry |
| `--json` | flag | - | Output raw JSON response only |
| `--help` | flag | - | Show help message |

## Aspect Ratios

`auto`, `21:9`, `16:9`, `3:2`, `4:3`, `5:4`, `1:1`, `4:5`, `3:4`, `2:3`, `9:16`

## Resolutions

| Resolution | Price Multiplier |
|------------|------------------|
| 0.5K (512px) | 0.75x |
| 1K (default) | 1x |
| 2K | 1.5x |
| 4K | 2x |

## Examples

Basic edit:
```bash
bun nano-banana-2-edit.ts --prompt "Make it look like winter" --image "https://example.com/summer.png"
```

High resolution:
```bash
bun nano-banana-2-edit.ts --prompt "Add dramatic lighting" --image "photo.png" --resolution "2K"
```

With web search (for current styles/objects):
```bash
bun nano-banana-2-edit.ts --prompt "Add latest iPhone" --image "hand.png" --web-search
```

Multiple reference images:
```bash
bun nano-banana-2-edit.ts --prompt "Combine these styles" --image "style1.png,style2.png"
```

## Output

Returns JSON:
```json
{
  "success": true,
  "url": "https://v3b.fal.media/files/...",
  "localPath": "/home/workspace/Generations/260305/epwcysip-fal-ai-nano-banana-2-edit-add-sunset.png",
  "journalPath": "/home/workspace/Generations/.journal/260305/...",
  "durationMs": 28000
}
```

## Notes

- **Pricing**: $0.08/image base, with resolution multipliers
- **Web search**: +$0.015 when enabled
- **Safety**: 1 = most strict, 6 = least strict
- **Multi-image**: Can use multiple reference images

## API Reference

- Endpoint: `fal-ai/nano-banana-2/edit`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/nano-banana-2/edit)
- [Full Docs](https://fal.ai/models/fal-ai/nano-banana-2/edit/api)
