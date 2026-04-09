import {
  finalizeStandardOutput,
  FLUX_SIZES,
  parseToolArgs,
  runFalRequest,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/flux-2-max";
const TOOL_NAME = "flux-2-max";

const schema = {
  prompt: { type: "string", required: true, desc: "The prompt to generate an image from" },
  image_size: { type: "size", default: "landscape_4_3", desc: "Image size preset or WxH format", presets: FLUX_SIZES },
  seed: { type: "int", desc: "Seed for reproducibility" },
  safety_tolerance: { type: "enum", default: "2", values: ["1", "2", "3", "4", "5"], desc: "Safety tolerance (1=strict, 5=permissive)" },
  enable_safety_checker: { type: "boolean", default: true, desc: "Enable safety checker" },
  output_format: { type: "enum", default: "jpeg", values: ["jpeg", "png"], desc: "Output format" },
};

const args = parseToolArgs(schema, {
  scriptName: "flux-2-max.ts",
  toolName: TOOL_NAME,
  description: "FLUX.2 [max] text-to-image. State-of-the-art quality and precision.",
  examples: [
    "bun flux-2-max.ts --prompt 'A baroque sorceress in her arcane study'",
    "bun flux-2-max.ts --prompt 'A fantasy landscape' --image_size landscape_16_9",
  ],
});

const input: Record<string, unknown> = {
  prompt: args.prompt,
  image_size: args.image_size,
  safety_tolerance: args.safety_tolerance,
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
