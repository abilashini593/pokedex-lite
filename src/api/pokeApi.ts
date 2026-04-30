import type { PokemonDetails, PokemonListResponse } from '../types';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const fetchPokemonList = async (offset: number = 0, limit: number = 20): Promise<PokemonListResponse> => {
  const response = await fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch Pokemon list');
  return response.json();
};

export const fetchPokemonDetails = async (nameOrId: string | number): Promise<PokemonDetails> => {
  const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
  if (!response.ok) throw new Error(`Failed to fetch details for ${nameOrId}`);
  return response.json();
};

export const fetchAllTypes = async (): Promise<{ name: string; url: string }[]> => {
  const response = await fetch(`${BASE_URL}/type`);
  if (!response.ok) throw new Error('Failed to fetch types');
  const data = await response.json();
  return data.results.filter((type: { name: string }) => type.name !== 'unknown' && type.name !== 'shadow');
};

export const fetchPokemonByType = async (type: string): Promise<PokemonListResponse> => {
  const response = await fetch(`${BASE_URL}/type/${type}`);
  if (!response.ok) throw new Error(`Failed to fetch Pokemon for type ${type}`);
  const data = await response.json();
  
  // Transform the type response into the same format as the normal pokemon list response
  const results = data.pokemon.map((p: any) => p.pokemon);
  return {
    count: results.length,
    next: null,
    previous: null,
    results
  };
};

export const fetchAllPokemonNames = async () => {
  const response = await fetch(`${BASE_URL}/pokemon?limit=1000`);
  if (!response.ok) throw new Error('Failed to fetch all Pokémon');
  return response.json();
};
