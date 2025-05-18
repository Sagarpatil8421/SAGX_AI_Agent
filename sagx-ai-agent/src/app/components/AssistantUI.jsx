'use client';

import { useEffect, useState } from 'react';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamic import of Lottie with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

import robotDarkMode from '../../../public/lottie/robotDarkMode.json';
import robotLightMode from '../../../public/lottie/robotLightMode.json';

export default function AssistantUI() {
  const { handleClick, content } = useVoiceAssistant();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      if (typeof window !== 'undefined') {
        setIsDarkMode(document.body.classList.contains('dark-mode'));
      }
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-500"
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
      }}
    >
      {/* Background Blobs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full filter blur-3xl opacity-20 -z-10"
        style={{ backgroundColor: 'var(--primary)' }}
        animate={{ x: [0, 100, -100, 0], y: [0, -50, 50, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full filter blur-2xl opacity-25 top-20 left-10 -z-10"
        style={{ backgroundColor: 'var(--secondary)' }}
        animate={{ x: [-50, 50, -50], y: [50, -50, 50] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Lottie Robot Animation */}
      <motion.div
        className="mb-10 w-56"
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Lottie animationData={isDarkMode ? robotDarkMode : robotLightMode} loop={true} />
      </motion.div>

      {/* Title and Subtitle */}
      <motion.h1
        className="text-5xl font-extrabold tracking-widest neon-text drop-shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        S A G X
      </motion.h1>
      <p className="mt-2 italic text-center" style={{ color: 'var(--text-muted)' }}>
        Your AI Assistant is listening...
      </p>

      {/* Mic Button */}
      <motion.button
        onClick={handleClick}
        className="mt-12 text-3xl mic-button focus:outline-none"
        whileTap={{ scale: 0.9 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        🎤
      </motion.button>

      {/* Response */}
      <h2 className="mt-6 text-xl font-medium text-center max-w-md px-2">
        {content}
      </h2>
    </section>
  );
}
