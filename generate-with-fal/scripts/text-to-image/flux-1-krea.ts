import {
  finalizeStandardOutput,
  FLUX_SIZES,
  parseToolArgs,
  runFalRequest,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/flux-1/krea";
const TOOL_NAME = "flux-1-krea";

const schema = {
  prompt: { type: "string", required: true, desc: "The prompt to generate an image from" },
  image_size: { type: "size", default: "landscape_4_3", desc: "Image size preset or WxH format", presets: FLUX_SIZES },
  guidance_scale: { type: "float", default: 4.5, min: 1, max: 20, desc: "CFG scale (1-20)" },
  num_inference_steps: { type: "int", default: 28, min: 1, max: 50, desc: "Number of inference steps (1-50)" },
  seed: { type: "int", desc: "Seed for reproducibility" },
  acceleration: { type: "enum", default: "regular", values: ["none", "regular", "high"], desc: "Generation speed" },
  enable_safety_checker: { type: "boolean", default: true, desc: "Enable safety checker" },
  output_format: { type: "enum", default: "jpeg", values: ["jpeg", "png"], desc: "Output format" },
};

const args = parseToolArgs(schema, {
  scriptName: "flux-1-krea.ts",
  toolName: TOOL_NAME,
  description: "FLUX.1 Krea [dev] text-to-image. 12B parameter model with incredible aesthetics.",
  examples: [
    "bun flux-1-krea.ts --prompt 'A street photo of a woman in a subway'",
    "bun flux-1-krea.ts --prompt 'A landscape' --guidance_scale 5 --acceleration high",
  ],
});

const input: Record<string, unknown> = {
  prompt: args.prompt,
  image_size: args.image_size,
  guidance_scale: args.guidance_scale,
  num_inference_steps: args.num_inference_steps,
  acceleration: args.acceleration,
  enable_safety_checker: args.enable_safety_checker,
  output_format: args.output_format,
  sync_mode: true,
};

if (args.seed !== undefined) input.seed = args.seed;

const { response, error, durationMs } = await runFalRequest(ENDPOINT_ID, input);

await finalizeStandardOutput({
  endpointId: ENDPOINT_ID,
  toolName: TOOL_NAME,
  prompt: args.prompt as string,
  inputs: input,
  response,
  error,
  durationMs,
  seed: response.seed,
  notes: args.notes as string | undefined,
});
