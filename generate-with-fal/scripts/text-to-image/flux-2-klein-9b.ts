#!/usr/bin/env bun
/**
 * FLUX.2 Klein 9B - Text-to-Image Generation
 */

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

const ENDPOINT_ID = "fal-ai/flux-2/klein/9b";
const TOOL_NAME = "flux-2-klein-9b";

const args = parseToolArgs(
  {
    prompt: { type: "string", short: "p", required: true, desc: "Text prompt to generate from" },
    seed: { type: "int", desc: "Random seed for reproducibility" },
    steps: { type: "int", min: 4, max: 8, default: 4, desc: "Inference steps" },
    size: { type: "size", presets: FLUX_SIZES, default: "landscape_4_3", desc: "Image size" },
    format: { type: "enum", values: ["png", "jpeg", "webp"], default: "png", desc: "Output format" },
  },
  TOOL_NAME,
  "Text-to-image generation using FLUX.2 Klein 9B"
);

async function main() {
  const prompt = args.prompt as string;

  const input: Record<string, unknown> = {
    prompt,
    num_images: 1,
    image_size: args.size,
    num_inference_steps: args.steps,
    output_format: args.format,
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
