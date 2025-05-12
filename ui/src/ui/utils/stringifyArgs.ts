export default function stringifyArgs(args: any): string {
  try {
    return JSON.stringify(args);
  } catch {
    String(args);
  }
}