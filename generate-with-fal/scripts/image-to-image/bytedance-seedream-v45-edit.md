# ByteDance Seedream V4.5 Edit - Image Editing

Edit images using ByteDance's Seedream V4.5 model.

## Quick Usage

```bash
bun bytedance-seedream-v45-edit.ts --prompt "Make it cyberpunk" --image "https://example.com/photo.png"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Text prompt to edit the image |
| `--image` | string | (required) | Image URL(s) (comma-separated, max 10) |
| `--seed` | number | random | Random seed for reproducibility |
| `--size` | string | 2048x2048 | Image size preset or WxH |
| `--num-images` | number | 1 | Number of images to generate (1-6) |
| `--max-images` | number | 1 | Max images per generation (1-6) |
| `--safety` | boolean | true | Enable safety checker |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Size Presets

- `square_hd` - High quality square
- `square` - Standard square
- `portrait_4_3` - Portrait 4:3
- `portrait_16_9` - Portrait 16:9
- `landscape_4_3` - Landscape 4:3
- `landscape_16_9` - Landscape 16:9
- `auto_2K` - Auto 2K resolution
- `auto_4K` - Auto 4K resolution

Or use custom `WxH` format (e.g., `1920x1080`).

**Note:** Width and height must be between 1920 and 4096, or total pixels between 2560x1440 and 4096x4096.

## Examples

```bash
# Basic edit
bun bytedance-seedream-v45-edit.ts --prompt "Add a sunset" --image "https://example.com/photo.png"

# Multiple reference images
bun bytedance-seedream-v45-edit.ts --prompt "Combine these images" --image "url1.png,url2.png,url3.png"

# 4K output
bun bytedance-seedream-v45-edit.ts --prompt "Enhance details" --image "photo.png" --size auto_4K

# Multiple outputs
bun bytedance-seedream-v45-edit.ts --prompt "Variations" --image "photo.png" --num-images 3
```

## API Reference

https://fal.ai/models/fal-ai/bytedance/seedream/v4.5/edit/api
