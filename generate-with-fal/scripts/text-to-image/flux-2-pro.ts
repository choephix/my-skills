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

const ENDPOINT_ID = "fal-ai/flux-2-pro";
const TOOL_NAME = "flux-2-pro";

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "The text prompt to generate from" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
      size: { type: "size", presets: FLUX_SIZES, default: "landscape_4_3", desc: "Image size preset or custom WxH" },
      format: { type: "enum", values: ["jpeg", "png"], default: "jpeg", desc: "Output format" },
      safety: { type: "enum", values: ["1", "2", "3", "4", "5"], default: "2", desc: "Safety tolerance level" },
    },
    TOOL_NAME,
    "FLUX 2 Pro - Text-to-Image Generation"
  );

  const prompt = args.prompt as string;
  const input: Record<string, unknown> = {
    prompt,
    num_images: 1,
    image_size: args.size,
    output_format: args.format,
    safety_tolerance: args.safety,
    enable_safety_checker: true,
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
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No output URL in response" }));
    process.exit(1);
  }

  const localPath = await downloadAndSave(output.url, ENDPOINT_ID, prompt, output.contentType);
  const filename = localPath.split("/").pop() ?? "unknown.jpg";
  const actualSeed = response.seed as number | undefined;
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: output.url, localPath, journalPath, seed: actualSeed, durationMs }));
}

main();
