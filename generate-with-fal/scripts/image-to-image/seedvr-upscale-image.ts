#!/usr/bin/env bun
import {
  parseToolArgs,
  processImageUrl,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  getOutputUrl,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/seedvr/upscale/image";
const TOOL_NAME = "seedvr-upscale-image";
const TARGET_RESOLUTIONS = ["720p", "1080p", "1440p", "2160p"];

async function main() {
  const args = parseToolArgs(
    {
      image: { type: "image", short: "i", required: true, desc: "URL or local path of the image to upscale" },
      mode: { type: "enum", values: ["factor", "target"], default: "factor", desc: "Upscale mode" },
      factor: { type: "string", default: "2", desc: "Upscale factor when mode=factor" },
      target: { type: "enum", values: TARGET_RESOLUTIONS, default: "1080p", desc: "Target resolution when mode=target" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
      "noise-scale": { type: "string", default: "0.1", desc: "Noise scale for generation (0-1)" },
      format: { type: "enum", values: ["png", "jpg", "webp"], default: "jpg", desc: "Output format" },
    },
    TOOL_NAME,
    "SeedVR Upscale Image - AI Image Upscaling"
  );

  let imageUrl: string;
  try {
    imageUrl = await processImageUrl(args.image as string);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const factor = Math.min(10, Math.max(1, parseFloat(args.factor as string)));
  const noiseScale = Math.min(1, Math.max(0, parseFloat(args["noise-scale"] as string)));

  const input: Record<string, unknown> = {
    image_url: imageUrl,
    upscale_mode: args.mode,
    upscale_factor: factor,
    target_resolution: args.target,
    noise_scale: noiseScale,
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
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No output URL in response" }));
    process.exit(1);
  }

  const localPath = await downloadAndSave(output.url, ENDPOINT_ID, "upscaled", output.contentType);
  const filename = localPath.split("/").pop() ?? "unknown.jpg";
  const actualSeed = response.seed as number | undefined;
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: output.url, localPath, journalPath, seed: actualSeed, durationMs }));
}

main();
