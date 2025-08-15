export function generateBasicAuthHeader(
  clientId: string,
  clientSecret: string,
): string {
  const credentials = `${clientId}:${clientSecret}`;
  const encoded = Buffer.from(credentials).toString('base64');
  return `Basic ${encoded}`;
}
export function buildHeaders(
  client_id: string,
  client_secret: string,
): {
  'Content-Type': string;
  Authorization: string;
} {
  return {
    'Content-Type': 'application/json',
    Authorization: generateBasicAuthHeader(client_id, client_secret),
  };
}
