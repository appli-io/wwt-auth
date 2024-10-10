import axios                   from 'axios';
import { BadRequestException } from '@nestjs/common';

/**
 * Extracts the latitude and longitude from a Google Maps shortened URL
 * Example: https://maps.app.goo.gl/qqvfXPQAvuzUE7rK6
 * Returns: { lat: 40.73061, lng: -73.935242 }
 *
 * @param url
 */
export async function getCoordinates(url: string): Promise<{ lat: number; lng: number }> {
  if (!url.includes('goo.gl') && url.includes('!3d') && url.includes('!4d')) {
    return extractCoordinates(url);
  } else if (!url.includes('goo.gl')) {
    throw new BadRequestException('INVALID_GMAPS_URL');
  }

  const expandedUrl = await expandShortUrl(url);
  const coordinates = extractCoordinates(expandedUrl);

  return {
    lat: coordinates.lat,
    lng: coordinates.lng,
  };
}

async function expandShortUrl(shortUrl: string): Promise<string> {
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
