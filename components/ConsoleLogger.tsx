'use client';

import React, { useEffect } from 'react';

export default function ConsoleLogger() {
  useEffect(() => {
    console.log('Console logger mounted');
    
    // Create a function to capture all console.error calls
    const originalError = console.error;
    console.error = (...args) => {
      // Display the error in a more visible way
      if (document && typeof document !== 'undefined') {
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.bottom = '10px';
        errorDiv.style.right = '10px';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '10px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.maxWidth = '80%';
        errorDiv.style.maxHeight = '200px';
        errorDiv.style.overflow = 'auto';
        errorDiv.textContent = `Console Error: ${args.map(a => String(a)).join(' ')}`;
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
          document.body.removeChild(errorDiv);
        }, 5000);
      }
      
      // Call the original console.error
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);
  
  return null;
}