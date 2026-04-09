# Grok Imagine Image Edit - Image-to-Image Editing

Edit images using xAI's Grok model.

## Quick Usage

```bash
bun grok-imagine-image-edit.ts --prompt "Make it cyberpunk" --image "https://example.com/photo.png"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Edit description (max 8000 chars) |
| `--image` | string | - | Image URL(s), comma-separated (max 3) |
| `--num-images` | number | 1 | Number of images (1-4) |
| `--format` | string | "jpeg" | Output format: jpeg, png, webp |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Examples

```bash
# Simple edit
bun grok-imagine-image-edit.ts --prompt "Add a sunset sky" --image "photo.jpg"

# Style transfer
bun grok-imagine-image-edit.ts --prompt "Turn into an oil painting" --image "landscape.png"

# Multiple input images
bun grok-imagine-image-edit.ts --prompt "Blend these images" --image "img1.png,img2.png"

# Multiple outputs
bun grok-imagine-image-edit.ts --prompt "Variations" --image "photo.jpg" --num-images 4
```

## API Reference

https://fal.ai/models/xai/grok-imagine-image/edit/api
