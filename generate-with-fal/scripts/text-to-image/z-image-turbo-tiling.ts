#!/usr/bin/env bun

import {
  parseToolArgs,
  FLUX_SIZES,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/z-image/turbo/tiling";
const TOOL_NAME = "z-image-turbo-tiling";

const args = parseToolArgs(
  {
    prompt: { type: "string", short: "p", required: true, desc: "Text prompt to generate from" },
    seed: { type: "int", desc: "Random seed for reproducibility" },
    steps: { type: "int", min: 1, max: 8, default: 8, desc: "Inference steps (1-8)" },
    size: { type: "size", presets: FLUX_SIZES, default: "square_hd", desc: "Image size" },
    format: { type: "enum", values: ["png", "jpeg", "webp"], default: "png", desc: "Output format" },
    acceleration: { type: "enum", values: ["none", "regular", "high"], default: "regular", desc: "Acceleration level" },
    tile_size: { type: "int", min: 32, max: 256, default: 128, desc: "Tile size in latent space (64=512px, 128=1024px, 256=2048px)" },
    tile_stride: { type: "int", min: 16, max: 128, default: 64, desc: "Tile stride in latent space (32=256px, 64=512px, 128=1024px)" },
    tiling_mode: { type: "enum", values: ["both", "horizontal", "vertical"], default: "both", desc: "Tiling direction" },
    expand_prompt: { type: "boolean", default: false, desc: "Enable prompt expansion (+$0.0025)" },
  },
  TOOL_NAME,
  "Generate seamlessly tiling images using Z-Image Turbo"
);

async function main() {
  const prompt = args.prompt as string;

  const input: Record<string, unknown> = {
    prompt,
    num_images: 1,
    image_size: args.size,
    num_inference_steps: args.steps,
    output_format: args.format,
    acceleration: args.acceleration,
    tile_size: args.tile_size,
    tile_stride: args.tile_stride,
    tiling_mode: args.tiling_mode,
    enable_prompt_expansion: args.expand_prompt,
  };
  if (args.seed !== undefined) input.seed = args.seed;

  const startTime = Date.now();
  let response: FalResponse;
  let error: string | null = null;

  try {
    response = await submitSync(ENDPOINT_ID, input);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
    response = { error };
  }

  const durationMs = Date.now() - startTime;
  const output = getOutputUrl(response);

  if (args.json) {
    console.log(JSON.stringify({ ...response, durationMs }, null, 2));
    process.exit(error ? 1 : 0);
  }

  if (error || !output) {
    const filename = `error-${TOOL_NAME}-${Date.now()}.md`;
    const journalEntry: JournalEntry = {
      endpoint: ENDPOINT_ID,
      tool: TOOL_NAME,
      inputs: input,
      result: response,
      durationMs,
      success: false,
      notes: args.notes as string | undefined,
    };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No output URL in response" }));
    process.exit(1);
  }

  const localPath = await downloadAndSave(output.url, ENDPOINT_ID, prompt, output.contentType);
  const filename = localPath.split("/").pop() ?? "unknown.png";
  const actualSeed = response.seed as number | undefined;

  const journalEntry: JournalEntry = {
    endpoint: ENDPOINT_ID,
    tool: TOOL_NAME,
    inputs: input,
    result: response,
    durationMs,
    success: true,
    notes: args.notes as string | undefined,
  };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(
    JSON.stringify({
      success: true,
      url: output.url,
      localPath,
      journalPath,
      seed: actualSeed,
      durationMs,
    })
  );
}

main();
