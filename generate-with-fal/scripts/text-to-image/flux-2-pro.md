# FLUX 2 Pro - Text-to-Image Generation

Text-to-image generation with FLUX.2 [pro] from Black Forest Labs. Optimized for maximum quality, exceptional photorealism and artistic images.

## Quick Usage

```bash
bun flux-2-pro.ts --prompt "A sunset over mountains"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Text prompt to generate from |
| `--seed` | number | random | Random seed for reproducibility |
| `--size` | string | "landscape_4_3" | Image size preset or WxH |
| `--format` | string | "jpeg" | Output format (jpeg, png) |
| `--safety` | string | "2" | Safety tolerance (1-5) |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Size Presets

- `square_hd` - High definition square
- `square` - Standard square
- `portrait_4_3` - Portrait 4:3 aspect ratio
- `portrait_16_9` - Portrait 16:9 aspect ratio
- `landscape_4_3` - Landscape 4:3 aspect ratio
- `landscape_16_9` - Landscape 16:9 aspect ratio

Or use custom `WxH` format (e.g., `1920x1080`).

## Examples

```bash
# Basic usage
bun flux-2-pro.ts --prompt "A cyberpunk city at night"

# Specific size and seed
bun flux-2-pro.ts --prompt "A forest" --size square --seed 12345

# Landscape 16:9
bun flux-2-pro.ts --prompt "Mountain landscape" --size landscape_16_9
```

## API Reference

https://fal.ai/models/fal-ai/flux-2-pro/api
