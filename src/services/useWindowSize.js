/**
 * hook used to effect change
 *
 * initialy copied from:
 *    https://stackoverflow.com/a/36862446/12334204
 * expanded to give bootstrap grid screen booleans:
 *    https://www.w3schools.com/bootstrap/bootstrap_grid_system.asp
 *
 * initially created for dynamically hiding columns on small screens
 * can be used other places as well
 *
 * started Brett 8/27/20
 */

import { useState, useEffect } from 'react';

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  const isXS = width < 768;
  const isSM = width > 768;
  const isMD = width > 992;
  const isLG = width > 1200;
  return {
    width,
    height,
    isXS,
    isSM,
    isMD,
    isLG,
  };
}

export default function useWindowSize() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}
