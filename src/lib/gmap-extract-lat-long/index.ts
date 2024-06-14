import axios from 'axios';

/**
 * Extracts the latitude and longitude from a Google Maps shortened URL
 * Example: https://maps.app.goo.gl/qqvfXPQAvuzUE7rK6
 * Returns: { lat: 40.73061, lng: -73.935242 }
 *
 * @param url
 */
export async function getCoordinates(url: string): Promise<{ lat: number; lng: number }> {
  const expandedUrl = await expandShortUrl(url);
  const coordinates = extractCoordinates(expandedUrl);

  return {
    lat: coordinates.lat,
    lng: coordinates.lng,
  };
}

async function expandShortUrl(shortUrl: string): Promise<string> {
  // Usa un servicio para expandir la URL corta a una URL completa
  const response = await axios.get(shortUrl);
  return response.request.res.responseUrl;
}

function extractCoordinates(url: string): { lat: number; lng: number } | null {
  const matches = url.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (matches) {
    return {
      lat: parseFloat(matches[1]),
      lng: parseFloat(matches[2]),
    };
  }
  return null;
}
