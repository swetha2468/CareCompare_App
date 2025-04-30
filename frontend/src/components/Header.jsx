import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

function Header() {
  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Symptom Checker', path: '/symptom-checker' },
    { label: 'Compare Plans', path: '/compare-plans' },
    { label: 'Insurance Directory', path: '/insurance-directory' },
  ];
}

export default Header; 