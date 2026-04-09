#!/usr/bin/env bun
import {
  parseToolArgs,
  submitSync,
  downloadAndSave,
  saveJournalEntry,
  type FalResponse,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/meshy/v6/text-to-3d";
const TOOL_NAME = "meshy-v6-text-to-3d";
const MODES = ["preview", "full"];
const ART_STYLES = ["realistic", "sculpture"];
const TOPOLOGIES = ["quad", "triangle"];
const SYMMETRY_MODES = ["off", "auto", "on"];

async function main() {
  const args = parseToolArgs(
    {
      prompt: { type: "string", short: "p", required: true, desc: "Description of the 3D model (max 600 chars)" },
      mode: { type: "enum", values: MODES, default: "full", desc: "Generation mode" },
      "art-style": { type: "enum", values: ART_STYLES, default: "realistic", desc: "Art style" },
      topology: { type: "enum", values: TOPOLOGIES, default: "triangle", desc: "Mesh topology" },
      polycount: { type: "int", min: 100, max: 300000, default: 30000, desc: "Target polygon count" },
      symmetry: { type: "enum", values: SYMMETRY_MODES, default: "auto", desc: "Symmetry mode" },
      pbr: { type: "boolean", default: false, desc: "Generate PBR maps" },
      "t-pose": { type: "boolean", default: false, desc: "Generate in A/T pose" },
      seed: { type: "int", desc: "Random seed for reproducibility" },
    },
    {
      scriptName: "meshy-v6-text-to-3d.ts",
      toolName: TOOL_NAME,
      description: "Meshy v6 Text-to-3D - Generate 3D models from text",
      examples: [
        'bun meshy-v6-text-to-3d.ts --prompt "A rustic wooden treasure chest"',
        'bun meshy-v6-text-to-3d.ts --prompt "A dragon" --art-style sculpture --polycount 50000',
      ],
    }
  );

  const prompt = (args.prompt as string).slice(0, 600);
  const input: Record<string, unknown> = {
    prompt,
    mode: args.mode,
    art_style: args["art-style"],
    topology: args.topology,
    target_polycount: args.polycount,
    symmetry_mode: args.symmetry,
    enable_pbr: args.pbr,
    is_a_t_pose: args["t-pose"],
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

  if (error || !response.model_glb?.url) {
    const filename = `error-${TOOL_NAME}-${Date.now()}.md`;
    const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: false, notes: args.notes as string | undefined };
    await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);
    console.error(JSON.stringify({ success: false, error: error ?? "No model in response" }));
    process.exit(1);
  }

  const glbPath = await downloadAndSave(response.model_glb.url, ENDPOINT_ID, prompt, response.model_glb.content_type);
  let thumbnailPath: string | undefined;
  if (response.thumbnail?.url) {
    thumbnailPath = await downloadAndSave(response.thumbnail.url, ENDPOINT_ID, `${prompt}-thumb`, response.thumbnail.content_type);
  }

  const filename = glbPath.split("/").pop() ?? "unknown.glb";
  const actualSeed = response.seed as number | undefined;
  const journalEntry: JournalEntry = { endpoint: ENDPOINT_ID, tool: TOOL_NAME, inputs: input, result: response, durationMs, success: true, notes: args.notes as string | undefined };
  const journalPath = await saveJournalEntry(ENDPOINT_ID, filename, journalEntry);

  console.log(JSON.stringify({ success: true, glb: glbPath, thumbnail: thumbnailPath, seed: actualSeed, journalPath, durationMs }));
}

main();
