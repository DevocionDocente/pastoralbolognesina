import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runProcess(binary: string, args: string[], timeoutMs = 30 * 60 * 1000): Promise<string> {
  const { stdout } = await execFileAsync(binary, args, { maxBuffer: 64 * 1024 * 1024, timeout: timeoutMs, windowsHide: true });
  return stdout;
}
