#!/usr/bin/env bun
import {
  parseToolArgs,
  runFalRequest,
  finalizeStandardOutput,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/stable-cascade/sote-diffusion";
const TOOL_NAME = "sote-diffusion";

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "The prompt to use" },
      "negative-prompt": { type: "string", desc: "What to avoid in the image" },
      "first-stage-steps": { type: "int", min: 4, max: 50, default: 25, desc: "First stage steps" },
      "second-stage-steps": { type: "int", min: 4, max: 24, default: 10, desc: "Second stage steps" },
      "guidance-scale": { type: "float", min: 0, max: 20, default: 8, desc: "CFG scale for first stage" },
      "second-stage-guidance-scale": { type: "float", min: 0, max: 20, default: 2, desc: "CFG scale for second stage" },
      width: { type: "int", default: 1024, desc: "Image width" },
      height: { type: "int", default: 1536, desc: "Image height" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
      safety: { type: "boolean", default: true, desc: "Enable safety checker" },
    },
    {
      scriptName: "sote-diffusion.ts",
      toolName: TOOL_NAME,
      description: "SoteDiffusion - Anime finetune of Würstchen V3 for text-to-image generation",
      examples: [
        'bun sote-diffusion.ts --prompt "1girl, pink hair, blue eyes, anime key visual"',
        'bun sote-diffusion.ts --prompt "mecha city at sunset, anime style" --negative-prompt "realistic, blurry" --seed 1234',
      ],
    }
  );

  const prompt = args.prompt as string;
  const input: Record<string, unknown> = {
    prompt,
    negative_prompt: (args["negative-prompt"] as string | undefined) ?? "",
    first_stage_steps: args["first-stage-steps"],
    second_stage_steps: args["second-stage-steps"],
    guidance_scale: args["guidance-scale"],
    second_stage_guidance_scale: args["second-stage-guidance-scale"],
    image_size: { width: args.width, height: args.height },
    enable_safety_checker: args.safety,
    num_images: 1,
  };
  if (args.seed !== undefined) input.seed = args.seed;

  const { response, error, durationMs } = await runFalRequest(ENDPOINT_ID, input);
  await finalizeStandardOutput({
    endpointId: ENDPOINT_ID,
    toolName: TOOL_NAME,
    prompt,
    inputs: input,
    response,
    error,
    durationMs,
    jsonOnly: args.json as boolean,
    notes: args.notes as string | undefined,
    fallbackError: "No image in response",
    seed: (response.seed as number | undefined) ?? (args.seed as number | undefined),
  });
}

main();
