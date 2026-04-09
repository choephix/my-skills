# BiRefNet V2 - Background Removal

Remove backgrounds from images using BiRefNet V2.

## Quick Usage

```bash
bun birefnet-v2.ts --image "https://example.com/photo.jpg"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--image` | string | (required) | URL of the image to remove background from |
| `--model` | string | "General Use (Light)" | Model variant to use |
| `--resolution` | string | "1024x1024" | Operating resolution |
| `--output-mask` | boolean | false | Also output the mask used |
| `--refine` | boolean | true | Refine foreground using mask |
| `--format` | string | "png" | Output format (png, webp, gif) |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Models

- **General Use (Light)** - Fast, good for most cases
- **General Use (Light 2K)** - Trained with 2K images
- **General Use (Heavy)** - Slower but more accurate
- **General Use (Dynamic)** - Supports 256-2304px resolutions
- **Matting** - Specific for matting
- **Portrait** - Optimized for portraits

## Resolutions

- `1024x1024` - Default, good for most images
- `2048x2048` - Higher quality for large images
- `2304x2304` - Only for "General Use (Dynamic)" model

## Examples

```bash
# Basic usage
bun birefnet-v2.ts --image "https://example.com/photo.jpg"

# Portrait with high resolution
bun birefnet-v2.ts --image "https://example.com/portrait.jpg" --model "Portrait" --resolution "2048x2048"

# Output mask alongside result
bun birefnet-v2.ts --image "https://example.com/photo.jpg" --output-mask
```

## API Reference

https://fal.ai/models/fal-ai/birefnet/v2/api
