'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useCookies } from 'next-client-cookies';
import ReactSelect from 'react-select';

import {
  City,
  PostalCode,
} from '@/app/core/interfaces/postalCode';
import {
  getCitiesByCode,
  searchPostalCodes,
} from '@/app/core/services/client/postalCodeService';

interface Props {
  onSelect?: (code: string, city: City) => void;
  defaultCode?: string;
  defaultCityId?: string;
}

export default function PostalCodeSelect({ onSelect, defaultCode, defaultCityId }: Props) {
  const token = useCookies().get('token');

  // Options react-select pour les codes postaux
  const [codeOptions, setCodeOptions]   = useState<{ value: string; label: string }[]>([]);
  const [codeInput, setCodeInput]       = useState('');
  const [selectedCode, setSelectedCode] = useState<{ value: string; label: string } | null>(null);

  // Villes correspondant au code sélectionné
  const [cities, setCities]             = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string } | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);

  // Recherche des codes postaux (debounce 300ms)
  useEffect(() => {
    if (codeInput.length < 2) { setCodeOptions([]); return; }
    const timer = setTimeout(async () => {
      const results: PostalCode[] = await searchPostalCodes(token, codeInput);
      setCodeOptions(results.map(r => ({
        value: r.code,
        label: `${r.code}`
      })));
    }, 300);
    return () => clearTimeout(timer);
  }, [codeInput]);

  // Chargement des villes à la sélection d'un code
  useEffect(() => {
    if (!selectedCode) { setCities([]); setSelectedCity(null); return; }
    setLoadingCities(true);
    getCitiesByCode(token, selectedCode.value).then(data => {
      setCities(data);
      // Si une seule ville, la sélectionner automatiquement
      if (data.length === 1) {
        const auto = { value: data[0].id, label: data[0].city };
        setSelectedCity(auto);
        onSelect?.(selectedCode.value, data[0]);
      } else {
        setSelectedCity(null);
      }
      setLoadingCities(false);
    });
  }, [selectedCode]);

  // Pré-remplissage si defaultCode fourni
  useEffect(() => {
    if (!defaultCode) return;
    setSelectedCode({ value: defaultCode, label: defaultCode });
  }, [defaultCode]);

  // Pré-sélection de la ville par défaut
  useEffect(() => {
    if (!defaultCityId || cities.length === 0) return;
    const found = cities.find(c => c.id === defaultCityId);
    if (found) setSelectedCity({ value: found.id, label: found.city });
  }, [defaultCityId, cities]);

  const cityOptions = cities.map(c => ({ value: c.id, label: c.city }));

  const selectStyles = {
    control: (base: object) => ({
      ...base,
      borderColor: 'var(--primary)',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '36px',
      '&:hover': { borderColor: 'var(--pink)' }
    }),
    option: (base: object, state: { isSelected: boolean; isFocused: boolean }) => ({
      ...base,
      fontSize: '14px',
      backgroundColor: state.isSelected ? 'var(--primary)' : state.isFocused ? 'var(--light-pink)' : 'white',
      color: state.isSelected ? 'white' : 'var(--text)',
    })
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <label className="text-sm text-(--text) font-medium">Code postal</label>
        <ReactSelect
          className="select"
          classNamePrefix="select"
          placeholder="Saisir un code postal..."
          noOptionsMessage={({ inputValue }) =>
            inputValue.length < 2 ? 'Saisir au moins 2 chiffres' : 'Aucun résultat'
          }
          options={codeOptions}
          inputValue={codeInput}
          value={selectedCode}
          onInputChange={(val) => setCodeInput(val)}
          onChange={(opt) => setSelectedCode(opt)}
          styles={selectStyles}
          isClearable
        />
      </div>

      {selectedCode && (
        <div className="flex flex-col gap-4">
          <label className="text-sm text-(--text) font-medium">Ville / Village</label>
          <ReactSelect
          className="select"
          classNamePrefix="select"
            placeholder={loadingCities ? 'Chargement...' : 'Sélectionner une ville...'}
            noOptionsMessage={() => 'Aucune ville trouvée'}
            options={cityOptions}
            value={selectedCity}
            isLoading={loadingCities}
            onChange={(opt) => {
              if (!opt) return;
              setSelectedCity(opt);
              const city = cities.find(c => c.id === opt.value);
              if (city) onSelect?.(selectedCode.value, city);
            }}
            styles={selectStyles}
            isClearable
          />
        </div>
      )}
    </div>
  );
}