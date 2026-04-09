import {
  finalizeStandardOutput,
  FLUX_SIZES,
  parseToolArgs,
  runFalRequest,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/flux-2";
const TOOL_NAME = "flux-2";

const schema = {
  prompt: { type: "string", required: true, desc: "The prompt to generate an image from" },
  image_size: { type: "size", default: "landscape_4_3", desc: "Image size preset or WxH format", presets: FLUX_SIZES },
  guidance_scale: { type: "float", default: 2.5, min: 0, max: 20, desc: "How closely to follow the prompt (0-20)" },
  num_inference_steps: { type: "int", default: 28, min: 4, max: 50, desc: "Number of inference steps (4-50)" },
  seed: { type: "int", desc: "Seed for reproducibility" },
  acceleration: { type: "enum", default: "regular", values: ["none", "regular", "high"], desc: "Acceleration level" },
  enable_prompt_expansion: { type: "boolean", default: false, desc: "Expand prompt for better results" },
  enable_safety_checker: { type: "boolean", default: true, desc: "Enable safety checker" },
  output_format: { type: "enum", default: "png", values: ["jpeg", "png", "webp"], desc: "Output format" },
};

const args = parseToolArgs(schema, {
  scriptName: "flux-2.ts",
  toolName: TOOL_NAME,
  description: "FLUX.2 [dev] text-to-image. Enhanced realism, crisper text generation.",
  examples: [
    "bun flux-2.ts --prompt 'A sunset over mountains'",
    "bun flux-2.ts --prompt 'A cyberpunk city' --image_size square_hd --seed 12345",
  ],
});

const input: Record<string, unknown> = {
  prompt: args.prompt,
  image_size: args.image_size,
  guidance_scale: args.guidance_scale,
  num_inference_steps: args.num_inference_steps,
  acceleration: args.acceleration,
  enable_prompt_expansion: args.enable_prompt_expansion,
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
