# FLUX 2 Pro Edit - Image-to-Image Editing

Image editing with FLUX.2 [pro] from Black Forest Labs. Ideal for high-quality image manipulation, style transfer, and sequential editing workflows.

## Quick Usage

```bash
bun flux-2-pro-edit.ts --prompt "Place realistic flames emerging from the top" --image "https://example.com/cup.png"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Text prompt to edit the image |
| `--image` | string | (required) | Image URL(s) (comma-separated) |
| `--seed` | number | random | Random seed for reproducibility |
| `--size` | string | "auto" | Image size preset or WxH |
| `--format` | string | "jpeg" | Output format (jpeg, png) |
| `--safety` | string | "2" | Safety tolerance (1-5) |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Size Presets

- `auto` - Use input image size (default)
- `square_hd` - High definition square
- `square` - Standard square
- `portrait_4_3` - Portrait 4:3 aspect ratio
- `portrait_16_9` - Portrait 16:9 aspect ratio
- `landscape_4_3` - Landscape 4:3 aspect ratio
- `landscape_16_9` - Landscape 16:9 aspect ratio

Or use custom `WxH` format (e.g., `1920x1080`).

## Examples

```bash
# Basic edit
bun flux-2-pro-edit.ts --prompt "Add flames to the cup" --image "https://example.com/cup.png"

# Multiple reference images
bun flux-2-pro-edit.ts --prompt "Combine these" --image "url1.png,url2.png"

# With specific size
bun flux-2-pro-edit.ts --prompt "Make it cyberpunk" --image "photo.jpg" --size square

# With seed
bun flux-2-pro-edit.ts --prompt "Add clouds" --image "sky.png" --seed 12345
```

## API Reference

https://fal.ai/models/fal-ai/flux-2-pro/edit/api
