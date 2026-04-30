import React, { useState, useEffect } from 'react';
import type { PokemonDetails } from '../types';
import { fetchPokemonDetails } from '../api/pokeApi';
import { Heart } from 'lucide-react';
import './PokemonCard.css';

interface PokemonCardProps {
  name: string;
  url?: string;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
  onClick: (name: string) => void;
}

const typeColors: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

export const PokemonCard: React.FC<PokemonCardProps> = ({ name, isFavorite, onToggleFavorite, onClick }) => {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const data = await fetchPokemonDetails(name);
        setDetails(data);
      } catch (error) {
        console.error('Failed to load details for', name);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [name]);

  const mainType = details?.types[0]?.type.name || 'normal';
  const bgColor = typeColors[mainType] || typeColors.normal;

  return (
    <div 
      className="pokemon-card" 
      style={{ '--card-color': bgColor } as React.CSSProperties}
      onClick={() => onClick(name)}
    >
      <div className="card-header">
        <span className="pokemon-id">#{details?.id.toString().padStart(3, '0') || '---'}</span>
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(name);
          }}
          aria-label="Toggle Favorite"
        >
          <Heart fill={isFavorite ? 'currentColor' : 'none'} size={20} />
        </button>
      </div>
      
      <div className="pokemon-image-container">
        {loading ? (
          <div className="loading-sprite"></div>
        ) : (
          <img 
            src={details?.sprites.other['official-artwork'].front_default || details?.sprites.front_default} 
            alt={name} 
            className="pokemon-image"
            loading="lazy"
          />
        )}
      </div>

      <div className="card-info">
        <h3 className="pokemon-name">{name}</h3>
        <div className="pokemon-types">
          {details?.types.map(t => (
            <span key={t.type.name} className="type-badge" style={{ backgroundColor: typeColors[t.type.name] }}>
              {t.type.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
