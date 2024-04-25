export function capitalize(str: string) {
  return str
    .split(" ")
    .join("-")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("-");
}
