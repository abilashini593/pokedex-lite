import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('pokedex_favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites from local storage', e);
      }
    }
  }, []);

  const toggleFavorite = (name: string) => {
    setFavorites((prev: string[]) => {
      let newFavs;
      if (prev.includes(name)) {
        newFavs = prev.filter((f: string) => f !== name);
      } else {
        newFavs = [...prev, name];
      }
      localStorage.setItem('pokedex_favorites', JSON.stringify(newFavs));
      return newFavs;
    });
  };

  const isFavorite = (name: string) => favorites.includes(name);

  return { favorites, toggleFavorite, isFavorite };
};
