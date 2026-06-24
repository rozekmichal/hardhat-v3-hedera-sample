import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type EvidencePayload = {
  ok: boolean;
  flow: string;
  networkName?: string;
  chainId?: string;
  startedAt: string;
  finishedAt: string;
  data?: Record<string, unknown>;
  error?: Record<string, unknown>;
};

export function toJsonValue(value: unknown): unknown {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map(toJsonValue);
  }

  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, toJsonValue(entry)]),
    );
  }

  return value;
}

export function normalizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const maybeCode = "code" in error ? (error as { code?: unknown }).code : undefined;
    const maybeShortMessage =
      "shortMessage" in error
        ? (error as { shortMessage?: unknown }).shortMessage
        : undefined;

    return {
      name: error.name,
      message: error.message,
      code: maybeCode,
      shortMessage: maybeShortMessage,
      stack: error.stack,
    };
  }

  return {
    value: String(error),
  };
}

export async function writeEvidence(payload: EvidencePayload): Promise<string> {
  const resultsDir = "results";
  await mkdir(resultsDir, { recursive: true });

  const timestamp = payload.finishedAt.replaceAll(":", "-").replaceAll(".", "-");
  const filePath = join(resultsDir, `${timestamp}-${payload.flow}.json`);
  const normalizedPayload = toJsonValue(payload);

  await writeFile(filePath, `${JSON.stringify(normalizedPayload, null, 2)}\n`);
  console.log(`Evidence written to ${filePath}`);

  return filePath;
}
