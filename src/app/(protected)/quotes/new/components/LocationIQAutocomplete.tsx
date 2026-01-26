"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Anchor, 
  Plane, 
  Building, 
  Navigation, 
  Search, 
  Loader2, 
  X, 
  CheckCircle 
} from 'lucide-react';

export interface LocationIQFeature {
  place_id: string;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
    postcode?: string;
    road?: string;
    suburb?: string;
    county?: string;
    neighbourhood?: string;
    house_number?: string;
  };
}

export interface LocationData {
  name: string;
  city: string;
  country: string;
  countryCode: string;
  type: 'port' | 'airport' | 'city' | 'place' | 'harbor' | 'dock';
  portCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  fullAddress: string;
  osmId?: string;
}

interface LocationIQAutocompleteProps {
  value: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}

const LocationIQAutocomplete: React.FC<LocationIQAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  label,
  required = false
}) => {
  const [inputValue, setInputValue] = useState(value?.name || '');
  const [suggestions, setSuggestions] = useState<LocationIQFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const LOCAL_PORTS_DB: Array<{
    name: string;
    city: string;
    country: string;
    type: 'city' | 'port' | 'airport';
    lat: number;
    lon: number;
    code?: string;
  }> = [
    { name: 'Tokyo City', city: 'Tokyo', country: 'Japan', type: 'city', lat: 35.68, lon: 139.76 },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'port':
      case 'harbor':
      case 'dock':
        return <Anchor className="h-4 w-4" />;
      case 'airport':
        return <Plane className="h-4 w-4" />;
      case 'city':
        return <Building className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'port': return 'Sea Port';
      case 'airport': return 'Airport';
      case 'city': return 'City';
      default: return 'Location';
    }
  };

  useEffect(() => {
    if (value && showSuggestions) {
      setShowSuggestions(false);
    }
  }, [value, showSuggestions]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const isInsideContainer = containerRef.current?.contains(target);
      const isSuggestionButton = target.closest('.location-suggestion-button');
      
      if (
        containerRef.current &&
        !isInsideContainer &&
        !isSuggestionButton
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  useEffect(() => {
    if (value) {
      setInputValue(value.name);
      setShowSuggestions(false);
    }
  }, [value]);

  const searchLocalDatabase = (query: string): LocationIQFeature[] => {
    const normalizedQuery = query.toLowerCase();
    
    return LOCAL_PORTS_DB
      .filter(location =>
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.city.toLowerCase().includes(normalizedQuery) ||
        location.country.toLowerCase().includes(normalizedQuery)
      )
      .map(location => {
        const boundingbox: [string, string, string, string] = [
          (location.lat - 0.1).toString(),
          (location.lat + 0.1).toString(),
          (location.lon - 0.1).toString(),
          (location.lon + 0.1).toString()
        ];
        
        return {
          place_id: `local-${location.code || location.name}`,
          licence: 'Local Database',
          osm_type: 'local',
          osm_id: 0,
          boundingbox,
          lat: location.lat.toString(),
          lon: location.lon.toString(),
          display_name: location.name,
          class: location.type === 'port' || location.type === 'airport' ? 'transport' : 'place',
          type: location.type,
          importance: 0.9,
          address: {
            city: location.city,
            country: location.country,
            country_code: location.country.substring(0, 2).toUpperCase() || ''
          }
        };
      })
      .slice(0, 4);
  };

  useEffect(() => {
    const searchLocations = async (query: string) => {
      if (query.length < 2) return;

      setIsLoading(true);
      setApiStatus('loading');
      
      try {
        const localResults = searchLocalDatabase(query);
        
        if (localResults.length > 0) {
          setSuggestions(localResults);
          setApiStatus('success');
          setShowSuggestions(true);
        }

        let locationIQResults: LocationIQFeature[] = [];
        try {
          const apiKey = 'pk.f15b5391da0772168ecba607d5fe3136';
          const response = await fetch(
            `https://api.locationiq.com/v1/autocomplete.php?` +
            `key=${apiKey}&` +
            `q=${encodeURIComponent(query)}&` +
            `limit=5&` +
            `format=json`
          );
          
          if (response.ok) {
            const data = await response.json();
            locationIQResults = data || [];
          }
        } catch (locationIQError) {
          console.log('LocationIQ failed, trying OpenStreetMap...');
        }

        let osmResults: LocationIQFeature[] = [];
        if (locationIQResults.length === 0) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?` +
              `format=json&` +
              `q=${encodeURIComponent(query)}&` +
              `addressdetails=1&` +
              `limit=5&` +
              `email=contact@shippingapp.com`
            );
            
            if (response.ok) {
              const data = await response.json();
              osmResults = data.map((place: any) => ({
                place_id: place.place_id,
                licence: place.licence,
                osm_type: place.osm_type,
                osm_id: place.osm_id,
                boundingbox: place.boundingbox,
                lat: place.lat,
                lon: place.lon,
                display_name: place.display_name,
                class: place.class,
                type: place.type,
                importance: place.importance,
                address: place.address
              }));
            }
          } catch (osmError) {
            console.log('OpenStreetMap also failed');
          }
        }

        const allResults = [...localResults, ...locationIQResults, ...osmResults]
          .filter((v, i, a) => 
            a.findIndex(t => t.place_id === v.place_id) === i
          )
          .slice(0, 8);

        setSuggestions(allResults);
        setApiStatus(allResults.length > 0 ? 'success' : 'error');
        setShowSuggestions(true);
        
      } catch (error) {
        console.error('Final search error:', error);
        setApiStatus('error');
        
        const localResults = searchLocalDatabase(query);
        setSuggestions(localResults);
        setShowSuggestions(localResults.length > 0);
        
      } finally {
        setIsLoading(false);
      }
    };

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      await searchLocations(inputValue);
    }, 350);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [inputValue]);

  const extractLocationData = (feature: LocationIQFeature): LocationData => {
    const isLocal = feature.osm_type === 'local';
    
    let type: LocationData['type'] = 'place';
    
    if (feature.class === 'transport') {
      const lowerDisplayName = feature.display_name.toLowerCase();
      
      if (lowerDisplayName.includes('airport') || feature.type?.includes('airport')) {
        type = 'airport';
      } else if (lowerDisplayName.includes('port') || lowerDisplayName.includes('harbor') || 
                lowerDisplayName.includes('dock') || feature.type?.includes('port')) {
        type = 'port';
      } else {
        type = 'place';
      }
    } else if (feature.type && ['city', 'town', 'village'].includes(feature.type)) {
      type = 'city';
    }

    const city = feature.address?.city || feature.address?.town || feature.address?.village || '';
    const country = feature.address?.country || '';
    const countryCode = feature.address?.country_code?.toUpperCase() || '';

    let portCode: string | undefined;
    if (type === 'port' || type === 'airport') {
      if (isLocal) {
        const localPort = LOCAL_PORTS_DB.find(p => p.name === feature.display_name);
        portCode = localPort?.code;
      } else {
        const baseCode = feature.display_name
          .replace(/port|airport|international|seaport|harbor|terminal/gi, '')
          .trim()
          .substring(0, 3)
          .toUpperCase();
        portCode = countryCode ? `${baseCode}-${countryCode}` : baseCode;
      }
    }

    return {
      name: feature.display_name.split(',')[0],
      city: city || feature.display_name.split(',')[0],
      country,
      countryCode,
      type,
      portCode,
      coordinates: {
        lat: parseFloat(feature.lat),
        lng: parseFloat(feature.lon)
      },
      fullAddress: feature.display_name,
      osmId: isLocal ? undefined : feature.place_id
    };
  };

  const handleSelect = (feature: LocationIQFeature) => {
    const locationData = extractLocationData(feature);
    setInputValue(locationData.name);
    onChange(locationData);
  };

  const clearSelection = () => {
    setInputValue('');
    onChange(null);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-[#868686] mb-2">
        {label} {required && '*'}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-10 pr-10 w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors text-sm md:text-base placeholder:text-sm md:placeholder:text-base placeholder:text-gray-400"
          required={required && !value}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : inputValue ? (
            <button
              type="button"
              onClick={clearSelection}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {value && (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-1">
                  {getIcon(value.type)}
                  <span className="text-sm font-medium text-blue-900 ml-1 truncate">
                    {value.name}
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                  value.type === 'port' 
                    ? 'bg-blue-100 text-blue-800'
                    : value.type === 'airport'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {getTypeLabel(value.type)}
                </span>
              </div>
              <div className="text-xs text-gray-600 truncate">
                {value.city}, {value.country}
              </div>
              {value.portCode && (
                <div className="mt-1 text-xs font-medium text-gray-700">
                  Port Code: <code className="bg-white px-1.5 py-0.5 rounded border">{value.portCode}</code>
                </div>
              )}
            </div>
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 ml-2" />
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-64 overflow-y-auto">
          <div className="py-2">
            {suggestions.map((feature) => {
              const type = feature.class === 'transport' 
                ? (feature.display_name.toLowerCase().includes('airport') ? 'airport' : 'port')
                : feature.type || 'place';
              
              const isLocal = feature.osm_type === 'local';
              
              return (
                <button
                  key={`${feature.place_id}-${feature.osm_id}`}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(feature);
                  }}
                  className="location-suggestion-button w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                      type === 'port' ? 'bg-blue-100' :
                      type === 'airport' ? 'bg-purple-100' :
                      'bg-gray-100'
                    }`}>
                      {getIcon(type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate text-sm md:text-base">
                      {feature.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 truncate">
                      {feature.display_name.split(',').slice(1).join(',').trim() || 
                      `${feature.address?.city || ''}, ${feature.address?.country || ''}`}
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        type === 'port' ? 'bg-blue-100 text-blue-800' :
                        type === 'airport' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getTypeLabel(type)}
                      </span>
                      {isLocal && (
                        <span className="text-xs text-gray-500">📋 Local</span>
                      )}
                      {!isLocal && feature.importance > 0.6 && (
                        <span className="text-xs text-gray-500">✓ Good match</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Navigation className="h-3 w-3" />
                <span>Powered by LocationIQ</span>
              </div>
              <div className="text-xs text-gray-400">
                10,000 free requests/day
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationIQAutocomplete;