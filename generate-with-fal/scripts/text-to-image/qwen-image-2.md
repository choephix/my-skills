# Qwen Image 2 - Text-to-Image Generation

Qwen-Image-2.0 is a next-generation foundational unified generation-and-editing model. Supports Chinese and English prompts.

## Quick Usage

```bash
bun qwen-image-2.ts --prompt "A sunset over mountains"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Text prompt (Chinese and English) |
| `--seed` | number | random | Random seed (0-2147483647) |
| `--size` | string | "square_hd" | Image size preset or WxH |
| `--format` | string | "png" | Output format (jpeg, png, webp) |
| `--negative` | string | "" | Negative prompt (max 500 chars) |
| `--expand` | boolean | true | Enable prompt expansion |
| `--safety` | boolean | true | Enable safety checker |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Size Presets

- `square_hd` - High definition square (default)
- `square` - Standard square
- `portrait_4_3` - Portrait 4:3 aspect ratio
- `portrait_16_9` - Portrait 16:9 aspect ratio
- `landscape_4_3` - Landscape 4:3 aspect ratio
- `landscape_16_9` - Landscape 16:9 aspect ratio

Or use custom `WxH` format (e.g., `1920x1080`).

**Note:** Total pixels must be between 512x512 and 2048x2048.

## Examples

```bash
# English prompt
bun qwen-image-2.ts --prompt "A cyberpunk city at night"

# Chinese prompt
bun qwen-image-2.ts --prompt "可爱的熊猫在吃竹子"

# With negative prompt
bun qwen-image-2.ts --prompt "A forest" --negative "blurry, low quality"

# Specific size
bun qwen-image-2.ts --prompt "Abstract art" --size square --seed 12345
```

## API Reference

https://fal.ai/models/fal-ai/qwen-image-2/text-to-image/api
