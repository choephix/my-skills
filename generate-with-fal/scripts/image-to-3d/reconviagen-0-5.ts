#!/usr/bin/env bun
import {
  parseToolArgs,
  processImageUrls,
  downloadAndSave,
  saveJournalEntry,
  type JournalEntry,
} from "../common/lib.ts";

const ENDPOINT_ID = "fal-ai/reconviagen-0.5";
const TOOL_NAME = "reconviagen-0-5";
const RESOLUTIONS = ["512", "1024", "1536"];
const TEXTURE_SIZES = ["1024", "2048", "4096"];
const SS_SOURCES = ["direct", "mesh", "mvtrellis2"];
const MULTI_IMAGE_STRATEGIES = [
  "average_right",
  "weighted_average",
  "sequential",
  "average",
  "adaptive_guidance_weight",
  "fixed_guidance_rescale",
];

type QueueStatus = {
  status?: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED";
  request_id?: string;
  response_url?: string;
  status_url?: string;
  cancel_url?: string;
  logs?: unknown;
  metrics?: unknown;
  queue_position?: number;
};

type ReconResponse = {
  model_glb?: { url: string; content_type?: string };
  seed?: number;
  [key: string]: unknown;
};

function getFalKey(): string {
  const key = process.env.FAL_KEY || Bun.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY not found in environment variables");
  }
  return key;
}

async function submitQueue(input: Record<string, unknown>): Promise<QueueStatus> {
  const resp = await fetch(`https://queue.fal.run/${ENDPOINT_ID}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${getFalKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`API error ${resp.status}: ${error}`);
  }

  return resp.json();
}

async function getJson<T>(url: string): Promise<T> {
  const resp = await fetch(url, {
    headers: {
      Authorization: `Key ${getFalKey()}`,
    },
  });

  if (!resp.ok) {
    const error = await resp.text();
    throw new Error(`API error ${resp.status}: ${error}`);
  }

  return resp.json();
}

async function pollForResult(status: QueueStatus, timeoutMs = 10 * 60 * 1000): Promise<ReconResponse> {
  if (status.response_url) {
    const deadline = Date.now() + timeoutMs;
    const statusUrl = status.status_url;
    const responseUrl = status.response_url;

    while (Date.now() < deadline) {
      if (statusUrl) {
        const latest = await getJson<QueueStatus>(statusUrl);
        if (latest.status === "COMPLETED") {
          return getJson<ReconResponse>(responseUrl);
        }
      }
      await Bun.sleep(3000);
    }
    throw new Error("Timed out waiting for fal queue result");
  }

  if (status.request_id) {
    const responseUrl = `https://queue.fal.run/${ENDPOINT_ID}/requests/${status.request_id}`;
    const statusUrl = `https://queue.fal.run/${ENDPOINT_ID}/requests/${status.request_id}/status`;
    return pollForResult({ ...status, response_url: responseUrl, status_url: statusUrl }, timeoutMs);
  }

  throw new Error("Queue response missing request_id/response_url");
}

async function main() {
  const args = parseToolArgs(
    {
      image: { type: "images", short: "i", required: true, desc: "Image URL(s) or local path(s), comma-separated for multiple views" },
      resolution: { type: "enum", values: RESOLUTIONS, default: "1024", desc: "Output resolution" },
      "texture-size": { type: "enum", values: TEXTURE_SIZES, default: "2048", desc: "Texture resolution" },
      decimation: { type: "int", min: 5000, max: 2000000, default: 500000, desc: "Target vertex count" },
      "ss-source": { type: "enum", values: SS_SOURCES, default: "mesh", desc: "Sparse structure source" },
      strategy: { type: "enum", values: MULTI_IMAGE_STRATEGIES, default: "adaptive_guidance_weight", desc: "Multi-image merge strategy" },
      seed: { type: "int", min: 0, max: 2147483647, desc: "Random seed for reproducibility" },
    },
    {
      scriptName: "reconviagen-0-5.ts",
      toolName: TOOL_NAME,
      description: "ReconViaGen 0.5 - Image-to-3D Generation",
      examples: [
        'bun reconviagen-0-5.ts --image "object.png"',
        'bun reconviagen-0-5.ts --image "front.png,back.png,left.png" --resolution 1536 --texture-size 4096',
      ],
    }
  );

  let imageUrls: string[];
  try {
    imageUrls = await processImageUrls(args.image as string);
  } catch (err) {
    console.error(JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) }));
    process.exit(1);
  }

  const input: Record<string, unknown> = {
    image_urls: imageUrls,
    resolution: Number(args.resolution),
    texture_size: Number(args["texture-size"]),
    decimation_target: args.decimation,
    ss_source: args["ss-source"],
  };

  if (imageUrls.length > 1) {
    input.multi_image_strategy = args.strategy;
  }
  if (typeof args.seed === "number" && Number.isFinite(args.seed)) {
    input.seed = args.seed;
  }

  const startTime = Date.now();
  let response: ReconResponse = {};
  let error: string | null = null;

  try {
    const queued = await submitQueue(input);
    response = await pollForResult(queued);
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
    console.error(JSON.stringify({ success: false, error: error ?? "No model in response" }));
    process.exit(1);
  }

  const glbPath = await downloadAndSave(response.model_glb.url, ENDPOINT_ID, "reconviagen", response.model_glb.content_type);
  const filename = glbPath.split("/").pop() ?? "unknown.glb";
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

  console.log(JSON.stringify({ success: true, url: response.model_glb.url, glbPath, journalPath, seed: response.seed, durationMs }));
}

main();
