# Qwen Image 2 Edit - Image-to-Image Editing

Edit images using Qwen-Image-2.0. Supports up to 3 reference images. Reference them as "image 1", "image 2", "image 3" in your prompt.

## Quick Usage

```bash
bun qwen-image-2-edit.ts --prompt "Replace the cute kid with a chinese warrior" --image "https://example.com/photo.png"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Edit prompt (max 800 chars, Chinese/English) |
| `--image` | string | (required) | Image URL(s) (1-3, comma-separated) |
| `--seed` | number | random | Random seed (0-2147483647) |
| `--size` | string | input size | Image size preset or WxH |
| `--format` | string | "png" | Output format (jpeg, png, webp) |
| `--negative` | string | "" | Negative prompt (max 500 chars) |
| `--expand` | boolean | true | Enable prompt expansion |
| `--safety` | boolean | true | Enable safety checker |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Multi-Image Reference

When using multiple images, reference them in your prompt by number:
- "Use image 1's style on image 2"
- "Combine image 1 and image 2"

## Image Requirements

- 1-3 images required
- Resolution: 384-5000px each dimension
- Max size: 10MB each
- Formats: JPEG, JPG, PNG (no alpha), WEBP

## Examples

```bash
# Single image edit
bun qwen-image-2-edit.ts --prompt "Add a sunset" --image "photo.png"

# Replace subject
bun qwen-image-2-edit.ts --prompt "Replace the person with a robot" --image "portrait.jpg"

# Multi-image editing
bun qwen-image-2-edit.ts --prompt "Use image 1 style on image 2" --image "style.png,content.png"

# Chinese prompt
bun qwen-image-2-edit.ts --prompt "把背景换成星空" --image "photo.png"
```

## API Reference

https://fal.ai/models/fal-ai/qwen-image-2/edit/api
