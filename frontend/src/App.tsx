import CursorOrb      from './components/CursorOrb';
import ParticleField  from './components/ParticleField';
import Navbar         from './components/Navbar';
import HeroSection    from './components/HeroSection';
import UrlValidator   from './components/UrlValidator';
import PipelinePreview from './components/PipelinePreview';
import Footer         from './components/Footer';

/**
 * ClipSync — AI Content Growth Platform
 * Phase 1: YouTube URL Validator
 */
function App() {
  return (
    <>
      {/* Global interactive elements */}
      <CursorOrb />
      <ParticleField />

      {/* Fixed nav */}
      <Navbar />

      {/* Main content */}
      <main id="main-content">
        <HeroSection />
        <UrlValidator />
        <PipelinePreview />
      </main>

      <Footer />
    </>
  );
}

export default App;