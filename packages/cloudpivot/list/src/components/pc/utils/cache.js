export function columnsCacheKey(schemaCode) {
  return `table-view-${schemaCode}`;
}

export function widthCacheKey(schemaCode, controlKey) {
  return `table-width-${schemaCode}-${controlKey}`;
}

export function ganttColumnsCacheKey(schemaCode) {
  return `gantt-view-${schemaCode}`;
}
