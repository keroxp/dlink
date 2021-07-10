/**
 * Roughly search for export default declaration
 * @return `true` if `code` has default export statement(s).
 */
export function hasDefaultExport(code: string): boolean {
  if (/export[\s\t]*default[\s\t]/.test(code)) {
    return true;
  }

  const match = code.match(/export[\s\t]*{([^}]*)}/);
  if (match) {
    // Check if "default" exists in the list
    return match[1].split(",").some((entry) => {
      entry = entry.trim();
      return entry === "default" || /[\s\t]+as[\s\t]+default$/.test(entry);
    });
  }

  return false;
}
