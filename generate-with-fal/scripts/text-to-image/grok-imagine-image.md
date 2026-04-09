# Grok Imagine Image - Text-to-Image Generation

Text-to-image generation using xAI's Grok model.

## Quick Usage

```bash
bun grok-imagine-image.ts --prompt "A sunset over mountains"
bun grok-imagine-image.ts --prompt "Abstract art" --aspect-ratio 16:9
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Text description (max 8000 chars) |
| `--aspect-ratio` | string | "1:1" | Aspect ratio of generated image |
| `--num-images` | number | 1 | Number of images (1-4) |
| `--format` | string | "jpeg" | Output format: jpeg, png, webp |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Aspect Ratios

Wide: `2:1`, `20:9`, `19.5:9`, `16:9`, `4:3`, `3:2`
Square: `1:1`
Tall: `2:3`, `3:4`, `9:16`, `9:19.5`, `9:20`, `1:2`

## Examples

```bash
# Portrait
bun grok-imagine-image.ts --prompt "Mountain landscape" --aspect-ratio 9:16

# Multiple images
bun grok-imagine-image.ts --prompt "Variations of a cat" --num-images 4

# Wide format with PNG
bun grok-imagine-image.ts --prompt "Panoramic cityscape" --aspect-ratio 21:9 --format png
```

## API Reference

https://fal.ai/models/xai/grok-imagine-image/api
