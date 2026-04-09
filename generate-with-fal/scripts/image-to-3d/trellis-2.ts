#!/usr/bin/env bun
import {
  parseToolArgs,
  processImageUrl,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/trellis-2";
const TOOL_NAME = "trellis-2";
const RESOLUTIONS = ["512", "1024", "1536"];
const TEXTURE_SIZES = ["1024", "2048", "4096"];

async function main() {
  const args = parseToolArgs(
    {
      image: { type: "image", short: "i", required: true, desc: "Image URL or local path to convert to 3D" },
      resolution: { type: "enum", values: RESOLUTIONS, default: "1024", desc: "Output resolution" },
      "texture-size": { type: "enum", values: TEXTURE_SIZES, default: "2048", desc: "Texture resolution" },
      decimation: { type: "int", min: 5000, max: 2000000, default: 500000, desc: "Target vertex count" },
      remesh: { type: "boolean", default: true, desc: "Rebuild mesh topology" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
    },
    TOOL_NAME,
    "Trellis 2 - Image-to-3D Generation"
  );

  let imageUrl: string;
  try {
    imageUrl = await processImageUrl(args.image as string);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const input: Record<string, unknown> = {
    image_url: imageUrl,
    resolution: Number(args.resolution),
    texture_size: Number(args["texture-size"]),
    decimation_target: args.decimation,
    remesh: args.remesh,
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

  if (args.json) {
    console.log(JSON.stringify({ ...response, durationMs }, null, 2));
    process.exit(error ? 1 : 0);
  }

  const model = response.model_glb as { url: string; content_type?: string } | undefined;
  if (error || !model?.url) {
    const filename = `error-${TOOL_NAME}-${Date.now()}.md`;
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No model in response" }));
    process.exit(1);
  }

  const glbPath = await downloadAndSave(model.url, ENDPOINT_ID, "trellis-2", model.content_type);
  const filename = glbPath.split("/").pop() ?? "unknown.glb";
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, url: model.url, glbPath, journalPath, durationMs }));
}

main();
