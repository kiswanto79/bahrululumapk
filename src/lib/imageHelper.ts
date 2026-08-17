/**
 * Utility to format and optimize image URLs, including Google Drive sharing links
 */
export function formatImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Convert Google Drive sharing URLs (file/d/ID/...)
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  // Convert Google Drive query params (open?id=ID or uc?id=ID)
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1] && trimmed.includes('drive.google.com')) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  return trimmed;
}
