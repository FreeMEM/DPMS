/**
 * Converts video platform URLs to embeddable URLs.
 * Supports YouTube, Vimeo, and Dailymotion.
 * Returns null if the URL is not from a recognized platform.
 */
export const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  // YouTube
  let match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  // Dailymotion
  match = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
  if (match) return `https://www.dailymotion.com/embed/video/${match[1]}`;
  // Vimeo
  match = url.match(/vimeo\.com\/(\d+)/);
  if (match) return `https://player.vimeo.com/video/${match[1]}`;
  return null;
};

/**
 * Checks if a URL points to a playable video (direct file or embeddable platform).
 */
export const isVideoUrl = (url) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || getVideoEmbedUrl(url) !== null;
};
