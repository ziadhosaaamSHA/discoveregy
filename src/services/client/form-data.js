/**
 * Converts a plain object into FormData for multipart backend endpoints.
 * Empty values are skipped, arrays append repeated keys, and Blob/File values stay binary.
 */
export function buildFormData(payload = {}) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, String(item)));
      return;
    }
    formData.append(key, value instanceof Blob ? value : String(value));
  });
  return formData;
}
