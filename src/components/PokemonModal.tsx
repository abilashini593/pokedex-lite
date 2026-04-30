import React, { useEffect, useState } from 'react';
import { X, Heart, Shield, Sword, Activity } from 'lucide-react';
import type { PokemonDetails } from '../types';
import { fetchPokemonDetails } from '../api/pokeApi';
import './PokemonModal.css';

interface PokemonModalProps {
  pokemonName: string | null;
  onClose: () => void;
}

export const PokemonModal: React.FC<PokemonModalProps> = ({ pokemonName, onClose }) => {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pokemonName) return;
    
    const loadDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchPokemonDetails(pokemonName);
        setDetails(data);
      } catch (error) {
        console.error('Failed to load modal details', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDetails();
  }, [pokemonName]);

  if (!pokemonName) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatIcon = (statName: string) => {
    if (statName.includes('hp')) return <Heart size={16} />;
    if (statName.includes('attack')) return <Sword size={16} />;
    if (statName.includes('defense')) return <Shield size={16} />;
    return <Activity size={16} />;
  };

  return (
    <div className="modal-overlay active" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Close">
          <X size={24} />
        </button>
        
        {loading || !details ? (
          <div className="modal-loading">
            <div className="loading-spinner"></div>
            <p>Loading {pokemonName}...</p>
          </div>
        ) : (
          <div className="modal-body">
            <div className="modal-header">
              <h2 className="modal-title">{details.name}</h2>
              <span className="modal-id">#{details.id.toString().padStart(3, '0')}</span>
            </div>
            
            <div className="modal-image-wrapper">
              <img 
                src={details.sprites.other['official-artwork'].front_default || details.sprites.front_default} 
                alt={details.name} 
                className="modal-image"
              />
            </div>
            
            <div className="modal-stats">
              <h3>Base Stats</h3>
              {details.stats.map((stat: any) => (
                <div key={stat.stat.name} className="stat-row">
                  <div className="stat-label">
                    {getStatIcon(stat.stat.name)}
                    <span className="stat-name">{stat.stat.name.replace('-', ' ')}</span>
                  </div>
                  <div className="stat-bar-container">
                    <div 
                      className="stat-bar" 
                      style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="stat-value">{stat.base_stat}</span>
                </div>
              ))}
            </div>

            <div className="modal-info-grid">
              <div className="info-box">
                <h4>Height</h4>
                <p>{details.height / 10} m</p>
              </div>
              <div className="info-box">
                <h4>Weight</h4>
                <p>{details.weight / 10} kg</p>
              </div>
              <div className="info-box full-width">
                <h4>Abilities</h4>
                <p className="abilities-list">
                  {details.abilities.map((a: any) => a.ability.name.replace('-', ' ')).join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
