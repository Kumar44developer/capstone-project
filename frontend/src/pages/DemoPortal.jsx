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
