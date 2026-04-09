# WAN 2.7 - Text-to-Image Generation

Text-to-image generation with WAN 2.7 on fal.ai. Good prompt understanding, clean fantasy and illustrative outputs.

## Quick Usage

```bash
bun wan-2-7.ts --prompt "A cinematic white pegasus above the sea"
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--prompt` | string | (required) | Text prompt to generate from |
| `--seed` | number | random | Random seed for reproducibility |
| `--size` | string | `square_hd` | Image size preset or `WxH` |
| `--negative` | string | - | Negative prompt |
| `--safety` | boolean | true | Enable safety checker |
| `--notes` | string | - | Notes for journal |
| `--json` | boolean | false | Output raw JSON only |

## Size Presets

- `square_hd`
- `square`
- `portrait_4_3`
- `portrait_16_9`
- `landscape_4_3`
- `landscape_16_9`

## Examples

```bash
bun wan-2-7.ts --prompt "A winged horse landing on marble cliffs at sunrise"
bun wan-2-7.ts --prompt "A silver pegasus in thunderclouds" --size landscape_16_9 --seed 12345
```

## API Reference

https://fal.ai/models/fal-ai/wan/v2.7/text-to-image/api
