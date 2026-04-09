# FLUX.2 Klein 9B Edit

Image-to-image editing with FLUX.2 klein 9B from Black Forest Labs.

## Quick Usage

```bash
bun flux-2-klein-9b-edit.ts --prompt "Turn into a painting" --image "https://example.com/photo.png"
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | The text prompt to edit the image |
| `--image` | string | (required) | Image URL(s) to edit (comma-separated, max 4) |
| `--seed` | int | random | Random seed for reproducibility |
| `--steps` | int | 4 | Number of inference steps (4-8) |
| `--size` | string | input size | Image size preset or custom WxH |
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

For custom sizes, use `WxH` format (e.g., `1920x1080`).

## Examples

Basic edit:
```bash
bun flux-2-klein-9b-edit.ts --prompt "Make it look like a watercolor painting" --image "https://example.com/photo.png"
```

Multiple reference images:
```bash
bun flux-2-klein-9b-edit.ts --prompt "Combine into a collage" --image "url1.png,url2.png,url3.png"
```

Higher quality (more steps):
```bash
bun flux-2-klein-9b-edit.ts --prompt "Cyberpunk style" --image "photo.png" --steps 8
```

Custom output size:
```bash
bun flux-2-klein-9b-edit.ts --prompt "Make it cinematic" --image "photo.png" --size landscape_16_9
```

## Output

Returns JSON:
```json
{
  "success": true,
  "url": "https://v3b.fal.media/files/...",
  "localPath": "/home/workspace/Generations/260305/epvpvhpi-flux-2-klein-9b-edit-make-watercolor.png",
  "journalPath": "/home/workspace/Generations/.journal/260305/...",
  "seed": 12345,
  "durationMs": 2500
}
```

## Notes

- **Pricing**: $0.011/MP for input + output (input resized to 1MP)
- **Fast**: 4 steps default, 8 steps for higher quality
- **Multi-image**: Can use up to 4 reference images
- **Safety**: Enabled by default

## API Reference

- Endpoint: `fal-ai/flux-2/klein/9b/edit`
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/flux-2/klein/9b/edit)
- [Full Docs](https://fal.ai/models/fal-ai/flux-2/klein/9b/edit/api)
