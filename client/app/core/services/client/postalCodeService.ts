import {
  City,
  PostalCode,
} from '@/app/core/interfaces/postalCode';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export const searchPostalCodes = async (
  token: string | undefined,
  query: string
): Promise<PostalCode[]> => {
  if (query.length < 2) return [];
  const res = await fetch(`${BASE}/api/postalcodes/search?q=${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.ok ? res.json() : [];
};

export const getCitiesByCode = async (
  token: string | undefined,
  code: string
): Promise<City[]> => {
  const res = await fetch(`${BASE}/api/postalcodes/${code}/cities`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.ok ? res.json() : [];
};