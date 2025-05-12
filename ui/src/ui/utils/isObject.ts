export default function isObject(item: any): boolean {
  const type = typeof item;
  return !!item && (type === "function" || type === "object");
}
