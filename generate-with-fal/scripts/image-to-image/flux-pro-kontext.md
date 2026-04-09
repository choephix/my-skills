# FLUX Pro Kontext - Image-to-Image Editing

Image editing with FLUX.1 Kontext [pro] from Black Forest Labs. Handles both text and reference images as inputs for targeted, local edits and complex transformations.

## Quick Usage

```bash
bun flux-pro-kontext.ts --prompt "Put a donut next to the flour" --image "https://example.com/photo.png"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Text prompt to edit the image |
| `--image` | string | (required) | Image URL to edit |
| `--seed` | number | random | Random seed for reproducibility |
| `--guidance` | number | 3.5 | CFG scale (1-20) |
| `--aspect` | string | - | Aspect ratio (see below) |
| `--format` | string | "jpeg" | Output format (jpeg, png) |
| `--safety` | string | "2" | Safety tolerance (1-6) |
| `--enhance` | boolean | false | Enhance prompt for better results |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Aspect Ratios

`21:9`, `16:9`, `4:3`, `3:2`, `1:1`, `2:3`, `3:4`, `9:16`, `9:21`

## Examples

```bash
# Basic edit
bun flux-pro-kontext.ts --prompt "Add a sunset" --image "https://example.com/photo.png"

# With aspect ratio
bun flux-pro-kontext.ts --prompt "Make it cinematic" --image "photo.jpg" --aspect 21:9

# With seed for reproducibility
bun flux-pro-kontext.ts --prompt "Add clouds" --image "sky.png" --seed 12345

# With prompt enhancement
bun flux-pro-kontext.ts --prompt "make it look professional" --image "portrait.jpg" --enhance
```

## API Reference

https://fal.ai/models/fal-ai/flux-pro/kontext/api
