// Runtime counterpart of src/data/replay/types.ts Evidence.
const kinds = ['provider_official', 'internal', 'downstream_company', 'community', 'monitor', 'press', 'private_channel'];
const channels = ['status_page', 'social', 'support', 'blog', 'report', null];
const fields = ['id', 'at', 'kind', 'origin', 'provider', 'channel', 'excerpt', 'url', 'arrived_via', 'fictional'];

export function validateEvidence(value, allowedHosts) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) return ['Expected Evidence object'];
  for (const key of fields) if (!Object.hasOwn(value, key)) errors.push(`Missing ${key}`);
  for (const key of Object.keys(value)) if (!fields.includes(key)) errors.push(`Unexpected field ${key}`);
  for (const key of ['id', 'at', 'origin', 'excerpt']) {
    if (typeof value[key] !== 'string' || !value[key].trim()) errors.push(`${key} must be a nonempty string`);
  }
  if (!kinds.includes(value.kind)) errors.push('Invalid kind');
  if (value.provider !== null && typeof value.provider !== 'string') errors.push('Invalid provider');
  if (!channels.includes(value.channel)) errors.push('Invalid channel');
  if (typeof value.at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(value.at) || !Number.isFinite(Date.parse(value.at))) errors.push('at must be an ISO capture time');
  try {
    const url = new URL(value.url);
    if (typeof value.url !== 'string' || url.protocol !== 'https:' || url.username || url.password || url.port || !allowedHosts.includes(url.hostname)) errors.push('URL outside allowlist');
  } catch { errors.push('url must be an allowed HTTPS URL'); }
  if (value.arrived_via !== 'api') errors.push('arrived_via must be api');
  if (value.fictional !== false) errors.push('fictional must be false');
  return errors;
}
