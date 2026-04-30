import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PokemonCard } from './components/PokemonCard';
import { PokemonModal } from './components/PokemonModal';
import { useFavorites } from './hooks/useFavorites';
import { 
  fetchPokemonList, 
  fetchAllTypes, 
  fetchPokemonByType,
  fetchAllPokemonNames 
} from './api/pokeApi';
import type { PokemonListItem } from './types';

const ITEMS_PER_PAGE = 20;

function App() {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [allTypes, setAllTypes] = useState<{ name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const { toggleFavorite, isFavorite } = useFavorites();
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Load all types
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const types = await fetchAllTypes();
        setAllTypes(types);
      } catch (err) {
        console.error('Failed to load types', err);
      }
    };
    loadTypes();
  }, []);

  // Load ALL pokemon names once (for global search)
  useEffect(() => {
    const loadAllPokemon = async () => {
      try {
        const data = await fetchAllPokemonNames();
        setAllPokemon(data.results);
      } catch (err) {
        console.error('Failed to load all pokemon', err);
      }
    };
    loadAllPokemon();
  }, []);

  // Load paginated pokemon
  useEffect(() => {
    const loadPokemon = async () => {
      setLoading(true);
      setError(null);

      try {
        if (selectedType) {
          const data = await fetchPokemonByType(selectedType);
          setTotalCount(data.count);
          setPokemonList(data.results.slice(offset, offset + ITEMS_PER_PAGE));
        } else {
          const data = await fetchPokemonList(offset, ITEMS_PER_PAGE);
          setTotalCount(data.count);
          setPokemonList(data.results);
        }
      } catch (err) {
        console.error('Failed to load pokemon list', err);
        setError('Failed to load Pokémon. Please try again.');
        setPokemonList([]);
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [offset, selectedType]);

  // 🔥 GLOBAL SEARCH (important fix)
  const displayedPokemon = searchTerm
    ? allPokemon.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pokemonList;

  const handleNextPage = () => {
    if (offset + ITEMS_PER_PAGE < totalCount) {
      setOffset(prev => prev + ITEMS_PER_PAGE);
    }
  };

  const handlePrevPage = () => {
    if (offset - ITEMS_PER_PAGE >= 0) {
      setOffset(prev => prev - ITEMS_PER_PAGE);
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
    setOffset(0);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="app-title">Pokédex Lite</h1>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            className="btn"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="controls">
        <div style={{ position: 'relative', flex: 1, minWidth: '250px', maxWidth: '400px' }}>
          <Search
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }}
            size={20}
          />
          <input
            type="text"
            placeholder="Search Pokémon..."
            className="search-input"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="type-select" value={selectedType} onChange={handleTypeChange}>
          <option value="">All Types</option>
          {allTypes.map(type => (
            <option key={type.name} value={type.name}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading Pokémon...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>
          <h2>{error}</h2>
        </div>
      ) : displayedPokemon.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
          <h2>No Pokémon found</h2>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="pokemon-grid">
            {displayedPokemon.map(pokemon => (
              <PokemonCard
                key={pokemon.name}
                name={pokemon.name}
                isFavorite={isFavorite(pokemon.name)}
                onToggleFavorite={toggleFavorite}
                onClick={setSelectedPokemon}
              />
            ))}
          </div>

          {!searchTerm && (
            <div className="pagination">
              <button className="btn" onClick={handlePrevPage} disabled={offset === 0}>
                <ChevronLeft size={20} /> Previous
              </button>

              <span style={{ fontWeight: 'bold' }}>
                Page {Math.floor(offset / ITEMS_PER_PAGE) + 1} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
              </span>

              <button
                className="btn"
                onClick={handleNextPage}
                disabled={offset + ITEMS_PER_PAGE >= totalCount}
              >
                Next <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}

      <PokemonModal
        pokemonName={selectedPokemon}
        onClose={() => setSelectedPokemon(null)}
      />
    </div>
  );
}

export default App;