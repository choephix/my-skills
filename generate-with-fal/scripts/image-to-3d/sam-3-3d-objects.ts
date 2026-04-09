#!/usr/bin/env bun
import {
  parseToolArgs,
  processImageUrl,
  parseCsv,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/sam-3/3d-objects";
const TOOL_NAME = "sam-3-3d-objects";

async function main() {
  const args = parseToolArgs(
    {
      image: { type: "image", short: "i", required: true, desc: "Image URL or local path to reconstruct in 3D" },
      prompt: { type: "string", short: "p", desc: "Text prompt for auto-segmentation" },
      masks: { type: "string", desc: "Comma-separated mask URLs for segmentation" },
      "textured-glb": { type: "boolean", default: false, desc: "Export GLB with baked texture and UVs" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
    },
    TOOL_NAME,
    "SAM 3 3D Objects - Image-to-3D Reconstruction"
  );

  let imageUrl: string;
  try {
    imageUrl = await processImageUrl(args.image as string);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const maskUrls = parseCsv(args.masks as string | undefined);
  const input: Record<string, unknown> = {
    image_url: imageUrl,
    export_textured_glb: args["textured-glb"],
  };
  if (args.prompt) input.prompt = args.prompt;
  if (args.seed !== undefined) input.seed = args.seed;
  if (maskUrls.length > 0) input.mask_urls = maskUrls;

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

  if (error) {
    const filename = `error-${TOOL_NAME}-${Date.now()}.md`;
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error }));
    process.exit(1);
  }

  const modelGlb = response.model_glb as { url: string; content_type?: string } | undefined;
  const gaussianSplat = response.gaussian_splat as { url: string; content_type?: string } | undefined;
  const results: { glb?: string; splat?: string } = {};
  if (modelGlb?.url) results.glb = await downloadAndSave(modelGlb.url, ENDPOINT_ID, (args.prompt as string | undefined) || "3d-object", modelGlb.content_type);
  if (gaussianSplat?.url) results.splat = await downloadAndSave(gaussianSplat.url, ENDPOINT_ID, ((args.prompt as string | undefined) || "3d-object") + "-splat", gaussianSplat.content_type);
  if (!results.glb && !results.splat) {
    const filename = `error-${TOOL_NAME}-${Date.now()}.md`;
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: "No 3D outputs in response" }));
    process.exit(1);
  }

  const filename = (results.glb || results.splat)!.split("/").pop() ?? "unknown.glb";
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, glbPath: results.glb, splatPath: results.splat, glbUrl: modelGlb?.url, splatUrl: gaussianSplat?.url, journalPath, durationMs }));
}

main();
