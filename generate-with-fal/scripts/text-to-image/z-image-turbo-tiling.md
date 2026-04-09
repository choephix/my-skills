# Z-Image Turbo Tiling

Generate seamlessly tiling photorealistic images from text. Great for textures, patterns, and backgrounds.

## Quick Usage

```bash
bun scripts/text-to-image/z-image-turbo-tiling.ts --prompt "weathered brick wall with moss"
```

## Options

| Option | Default | Description |
|---|---|---|
| `--prompt` | *(required)* | Text prompt |
| `--steps` | 8 | Inference steps (1-8) |
| `--size` | square_hd | Image size preset or WxH |
| `--format` | png | Output: png, jpeg, webp |
| `--seed` | — | Random seed |
| `--acceleration` | regular | none, regular, high |
| `--tile_size` | 128 | Latent tile size (64=512px, 128=1024px, 256=2048px) |
| `--tile_stride` | 64 | Latent tile stride (32=256px, 64=512px, 128=1024px) |
| `--tiling_mode` | both | both, horizontal, vertical |
| `--expand_prompt` | false | Enable prompt expansion (+$0.0025) |
| `--json` | false | Raw JSON output |

## Examples

```bash
# Seamless texture for 3D
bun scripts/text-to-image/z-image-turbo-tiling.ts -p "mossy cobblestone floor, top-down, flat lighting"

# Horizontal-only tiling (e.g. for a banner)
bun scripts/text-to-image/z-image-turbo-tiling.ts -p "mountain range panorama" --tiling_mode horizontal

# High-res tile
bun scripts/text-to-image/z-image-turbo-tiling.ts -p "sci-fi metal panel with neon circuits" --tile_size 256
```

## API Reference

https://fal.ai/models/fal-ai/z-image/turbo/tiling
