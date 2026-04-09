# SeedVR Upscale Image - AI Image Upscaling

Upscale images using SeedVR2 AI upscaling.

## Quick Usage

```bash
bun seedvr-upscale-image.ts --image "https://example.com/low-res.jpg"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--image` | string | (required) | URL of the image to upscale |
| `--mode` | string | "factor" | Upscale mode: "factor" or "target" |
| `--factor` | number | 2 | Upscale factor (1-10) when mode=factor |
| `--target` | string | "1080p" | Target resolution when mode=target |
| `--seed` | number | random | Random seed for reproducibility |
| `--noise-scale` | number | 0.1 | Noise scale (0-1) |
| `--format` | string | "jpg" | Output format (png, jpg, webp) |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Target Resolutions

When using `--mode target`:
- `720p` - 1280x720
- `1080p` - 1920x1080
- `1440p` - 2560x1440
- `2160p` - 3840x2160 (4K)

## Examples

```bash
# 2x upscale (default)
bun seedvr-upscale-image.ts --image "https://example.com/low-res.jpg"

# 4x upscale
bun seedvr-upscale-image.ts --image "https://example.com/low-res.jpg" --factor 4

# Upscale to 4K
bun seedvr-upscale-image.ts --image "https://example.com/low-res.jpg" --mode target --target 2160p

# With seed for reproducibility
bun seedvr-upscale-image.ts --image "https://example.com/low-res.jpg" --seed 12345
```

## API Reference

https://fal.ai/models/fal-ai/seedvr/upscale/image/api
