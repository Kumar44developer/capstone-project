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
