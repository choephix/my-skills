import {
  finalizeStandardOutput,
  FLUX_SIZES,
  parseToolArgs,
  runFalRequest,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/flux-2-flex";
const TOOL_NAME = "flux-2-flex";

const schema = {
  prompt: { type: "string", required: true, desc: "The prompt to generate an image from" },
  image_size: { type: "size", default: "landscape_4_3", desc: "Image size preset or WxH format", presets: FLUX_SIZES },
  guidance_scale: { type: "float", default: 3.5, min: 1.5, max: 10, desc: "Guidance scale (1.5-10)" },
  num_inference_steps: { type: "int", default: 28, min: 2, max: 50, desc: "Number of inference steps (2-50)" },
  seed: { type: "int", desc: "Seed for reproducibility" },
  safety_tolerance: { type: "enum", default: "2", values: ["1", "2", "3", "4", "5"], desc: "Safety tolerance (1=strict, 5=permissive)" },
  enable_safety_checker: { type: "boolean", default: true, desc: "Enable safety checker" },
  output_format: { type: "enum", default: "jpeg", values: ["jpeg", "png"], desc: "Output format" },
};

const args = parseToolArgs(schema, {
  scriptName: "flux-2-flex.ts",
  toolName: TOOL_NAME,
  description: "FLUX.2 [flex] text-to-image. Adjustable steps and guidance for fine-tuned control.",
  examples: [
    "bun flux-2-flex.ts --prompt 'A fluffy monster eating a donut'",
    "bun flux-2-flex.ts --prompt 'A landscape' --guidance_scale 5 --num_inference_steps 40",
  ],
});

const input: Record<string, unknown> = {
  prompt: args.prompt,
  image_size: args.image_size,
  guidance_scale: args.guidance_scale,
  num_inference_steps: args.num_inference_steps,
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
