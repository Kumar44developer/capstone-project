import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import '../styles/DemoPortal.css';

export default function DemoPortal() {
  // Hierarchical browsing state
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subDistricts, setSubDistricts] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedState, setSelectedState] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false)

  // Stats
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load states and stats on mount
  useEffect(() => {
    loadInitialData();
  }, []);


  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statesData, statsData] = await Promise.all([
        apiService.getStates(),
        apiService.getStats()
      ]);
      setStates(statesData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      alert('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };


  const handleStateChange = async (e) => {
    const stateId = parseInt(e.target.value);
    setSelectedState(stateId);
    setSelectedDistrict(null);
    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setDistricts([]);
    setSubDistricts([]);
    setVillages([]);

    if (stateId) {
      try {
        const data = await apiService.getDistricts(stateId);
        setDistricts(data);
      } catch (err) {
        console.error('Failed to fetch districts:', err);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = parseInt(e.target.value);
    setSelectedDistrict(districtId);
    setSelectedSubDistrict(null);
    setSelectedVillage(null);
    setSubDistricts([]);
    setVillages([]);



    if (districtId) {
      try {
        const data = await apiService.getSubDistricts(districtId);
        setSubDistricts(data);
      } catch (err) {
        console.error('Failed to fetch sub-districts:', err);
      }
    }
  };


  const handleSubDistrictChange = async (e) => {
    const subDistrictId = parseInt(e.target.value);
    setSelectedSubDistrict(subDistrictId);
    setSelectedVillage(null);

    if (subDistrictId) {
      try {
        const data = await apiService.getVillages(subDistrictId, 1, 50);
        setVillages(data.data);
      } catch (err) {
        console.error('Failed to fetch villages:', err);
      }
    }
  };

  const handleVillageSelect = async (e) => {
    const villageId = parseInt(e.target.value);
    if (villageId) {
      try {
        const hierarchy = await apiService.getVillageHierarchy(villageId);
        setSelectedVillage(hierarchy);
      } catch (err) {
        console.error('Failed to fetch village hierarchy:', err);
      }
    }
  };


  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery || searchQuery.length < 2) {
      alert('Please enter at least 2 characters');
      return;
    }

    try {
      setSearching(true);
      const results = await apiService.searchVillages(searchQuery, 50);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      alert('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleSearchResultSelect = async (villageId) => {
    try {
      const hierarchy = await apiService.getVillageHierarchy(villageId);
      setSelectedVillage(hierarchy);
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      console.error('Failed to fetch village details:', err);
    }
  };


  if (loading) {
    return (
      <div className="demo-portal loading-container">
        <div className="spinner"></div>
        <p>Loading geographic data...</p>
      </div>
    );
  }

    return (
    <div className="demo-portal">
      {/* Hero Section */}
      <div className="hero">
        <h1>🗺️ India Geographic Data API</h1>
        <p>Access India's complete village-level geographic hierarchy</p>
        {stats && (
          <div className="stats-bar">
            <div className="stat"><strong>{stats.states}</strong> States</div>
            <div className="stat"><strong>{stats.districts}</strong> Districts</div>
            <div className="stat"><strong>{stats.subDistricts}</strong> Sub-Districts</div>
            <div className="stat"><strong>{(stats.villages / 1000).toFixed(0)}K</strong> Villages</div>
          </div>
        )}
      </div>

      <div className="container">
        {/* Search Section */}
        <div className="section search-section">
          <h2>🔍 Quick Search</h2>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for a village, district, or sub-district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" disabled={searching} className="btn btn-primary">
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>Results ({searchResults.length})</h3>
              <div className="results-list">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="result-item"
                    onClick={() => handleSearchResultSelect(item.id)}
                  >
                    <div className="result-title">{item.villageName}</div>
                    <div className="result-path">
                      {item.subDistrict} → {item.district} → {item.state}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>


                {/* Hierarchical Browse Section */}
        <div className="section hierarchy-section">
          <h2>📍 Browse Hierarchically</h2>

          <div className="hierarchy-controls">
            {/* State Selector */}
            <div className="control-group">
              <label>Select State:</label>
              <select onChange={handleStateChange} value={selectedState || ''}>
                <option value="">-- Choose a state --</option>
                {states.map(state => (
                  <option key={state.id} value={state.id}>
                    {state.stateName}
                  </option>
                ))}
              </select>
            </div>


            {/* District Selector */}
            <div className="control-group">
              <label>Select District:</label>
              <select
                onChange={handleDistrictChange}
                value={selectedDistrict || ''}
                disabled={!selectedState}
              >
                <option value="">-- Choose a district --</option>
                {districts.map(district => (
                  <option key={district.id} value={district.id}>
                    {district.districtName}
                  </option>
                ))}
              </select>
            </div>


            {/* Sub-District Selector */}
            <div className="control-group">
              <label>Select Sub-District:</label>
              <select
                onChange={handleSubDistrictChange}
                value={selectedSubDistrict || ''}
                disabled={!selectedDistrict}
              >
                <option value="">-- Choose a sub-district --</option>
                {subDistricts.map(sd => (
                  <option key={sd.id} value={sd.id}>
                    {sd.subDistrictName}
                  </option>
                ))}
              </select>
            </div>

            {/* Village Selector */}
            {villages.length > 0 && (
              <div className="control-group">
                <label>Select Village ({villages.length}):</label>
                <select onChange={handleVillageSelect}>
                  <option value="">-- Choose a village --</option>
                  {villages.map(village => (
                    <option key={village.id} value={village.id}>
                      {village.villageName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Village Details */}
        {selectedVillage && (
          <div className="section village-details">
            <h2>📌 Village Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <label>State</label>
                <div className="detail-value">{selectedVillage.state.name}</div>
                <div className="detail-code">Code: {selectedVillage.state.code}</div>
              </div>


              <div className="detail-item">
                <label>District</label>
                <div className="detail-value">{selectedVillage.district.name}</div>
                <div className="detail-code">Code: {selectedVillage.district.code}</div>
              </div>

              <div className="detail-item">
                <label>Sub-District</label>
                <div className="detail-value">{selectedVillage.subDistrict.name}</div>
                <div className="detail-code">Code: {selectedVillage.subDistrict.code}</div>
              </div>

              <div className="detail-item">
                <label>Village</label>
                <div className="detail-value">{selectedVillage.village.name}</div>
                <div className="detail-code">Code: {selectedVillage.village.code}</div>
              </div>
            </div>


            <div className="formatted-address">
              <h3>Formatted Address</h3>
              <p className="address-text">{selectedVillage.formatted}</p>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(selectedVillage.formatted);
                  alert('Copied to clipboard!');
                }}
              >
                📋 Copy Address
              </button>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="section cta-section">
          <h2>🚀 Ready to Integrate?</h2>
          <p>Get programmatic access to all geographic data with our REST API</p>
          <div className="cta-buttons">
            <a href="/register" className="btn btn-primary btn-large">
              Sign Up Free
            </a>
            <a href="/login" className="btn btn-outline btn-large">
              Already Have Account? Login
            </a>
          </div>
        </div>


        {/* API Documentation */}
        <div className="section api-docs">
          <h2>📚 API Quick Start</h2>
          <div className="code-block">
            <pre>{`# Search for villages
curl "https://api.example.com/api/v1/villages/search?q=Mumbai" \\
  -H "x-api-key: YOUR_KEY" \\
  -H "x-api-secret: YOUR_SECRET"



        
