# SoteDiffusion

Anime finetune of Würstchen V3 for text-to-image generation.

## Quick usage

```bash
bun scripts/text-to-image/sote-diffusion.ts --prompt "1girl, pink hair, blue eyes, anime key visual"
```

```bash
bun scripts/text-to-image/sote-diffusion.ts \
  --prompt "mecha city at sunset, anime style" \
  --negative-prompt "realistic, blurry, monochrome" \
  --first-stage-steps 25 \
  --second-stage-steps 10 \
  --guidance-scale 8 \
  --second-stage-guidance-scale 2
```

## Options

- `--prompt` required text prompt
- `--negative-prompt` things to avoid in the image
- `--first-stage-steps` integer 4-50, default 25
- `--second-stage-steps` integer 4-24, default 10
- `--guidance-scale` number 0-20, default 8
- `--second-stage-guidance-scale` number 0-20, default 2
- `--width` image width, default 1024
- `--height` image height, default 1536
- `--seed` reproducible seed
- `--safety` enable safety checker, default true
- `--notes` attach notes to the journal entry
- `--json` print raw API response with timing instead of downloading

## Notes

- Category: text-to-image
- Output schema returns `images`, `seed`, `timings`, `has_nsfw_concepts`, and `prompt`
- Script forces `num_images: 1`; generate multiple variations by running it multiple times in parallel
- Guidance options accept decimal values

## Links

- Playground: https://fal.ai/models/fal-ai/stable-cascade/sote-diffusion
- API docs: https://fal.ai/models/fal-ai/stable-cascade/sote-diffusion/api
- LLM docs: https://fal.ai/models/fal-ai/stable-cascade/sote-diffusion/llms.txt
- OpenAPI schema: https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/stable-cascade/sote-diffusion
