import React from 'react';

const CRTOverlay = () => {
  return (
    <>
      {/* CRT Scanlines */}
      <div className="crt-overlay" />
      
      {/* Vignette Effect */}
      <div className="vignette" />
      
      {/* Subtle Noise/Fog */}
      <div className="fog-overlay" />
    </>
  );
};

export default CRTOverlay;
