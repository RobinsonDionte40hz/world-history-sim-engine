/**
 * WorldBuilderLandingPage - Welcome landing page for world building
 * 
 * Provides a welcoming entry point to the world builder with a single
 * prominent "Create World" button, moving away from the rigid 6-step process.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, Users, Layers, Sparkles, Clock, Map, Mail, MessageSquare, Phone, Database, Shield, Share2, Play } from 'lucide-react';
import Navigation from '../UI/Navigation';
import DemoModal from '../components/DemoModal';
import { useWorldContext } from '../contexts/WorldContext';

const WorldBuilderLandingPage = () => {
  const navigate = useNavigate();
  const { importDemoWorld } = useWorldContext();
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([false, false, false]);
  const [heroButtonVisible, setHeroButtonVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState({
    cta: false,
    reviews: false,
    howItWorks: false,
    additionalFeatures: false
  });
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Handle world creation
  const handleCreateWorld = () => {
    navigate('/builder');
  };

  // Handle demo modal
  const handleOpenDemoModal = () => {
    setIsDemoModalOpen(true);
  };

  const handleCloseDemoModal = () => {
    setIsDemoModalOpen(false);
  };

  const handleSelectDemo = async (demoWorld) => {
    try {
      // First, import the demo world so it's saved and available
      const demoInfo = demoWorld.metadata || { name: demoWorld.name || 'Demo World' };
      const worldId = await importDemoWorld(demoWorld, demoInfo);
      
      console.log('Demo world imported with ID:', worldId);
      
      // Navigate to simulation with the demo world data
      // The demo world is already prepared for simulation, so we pass it directly
      navigate('/simulation', { state: { preparedWorld: demoWorld, isDemoWorld: true } });
    } catch (error) {
      console.error('Failed to import demo world before simulation:', error);
      // Fallback: still navigate to simulation even if import fails
      navigate('/simulation', { state: { preparedWorld: demoWorld, isDemoWorld: true } });
    }
  };

  const handleImportDemo = async (demoWorld, demoInfo) => {
    try {
      // Import the demo as a regular editable world
      const worldId = await importDemoWorld(demoWorld, demoInfo);
      
      // Navigate to the world builder with the imported world
      navigate('/world-builder', { 
        state: { 
          importedWorldId: worldId, 
          message: `Demo world "${demoInfo?.name}" imported successfully! You can now edit and customize it.` 
        } 
      });
    } catch (error) {
      console.error('Failed to import demo world:', error);
      // Handle error - could show a toast notification
    }
  };

  // Handle scroll for content visibility - OPTIMIZED with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const windowHeight = window.innerHeight;
          
          // Make content appear earlier and stay visible
          setContentVisible({
            cta: scrollPosition > windowHeight * 0.1,
            reviews: scrollPosition > windowHeight * 0.3,
            howItWorks: scrollPosition > windowHeight * 0.5,
            additionalFeatures: scrollPosition > windowHeight * 0.8
          });
          
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Throttle scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Entrance animations
  useEffect(() => {
    // Show "Welcome!" after 0.7 seconds (was 1s)
    const welcomeTimer = setTimeout(() => {
      setWelcomeVisible(true);
    }, 700);

    // Show "Build Your Dream World!" 0.7 seconds after welcome (1.4s total, was 2s)
    const subtitleTimer = setTimeout(() => {
      setSubtitleVisible(true);
    }, 1400);

    // Show cards one by one after subtitle (starting at 2.9s, 3.4s, 3.9s - 0.1s faster)
    const cardTimers = [
      setTimeout(() => {
        setCardsVisible(prev => [true, prev[1], prev[2]]);
      }, 2900),
      setTimeout(() => {
        setCardsVisible(prev => [prev[0], true, prev[2]]);
      }, 3400),
      setTimeout(() => {
        setCardsVisible(prev => [prev[0], prev[1], true]);
      }, 3900)
    ];

    // Show hero button after all cards (at 4.4s)
    const heroButtonTimer = setTimeout(() => {
      setHeroButtonVisible(true);
    }, 4400);

    return () => {
      clearTimeout(welcomeTimer);
      clearTimeout(subtitleTimer);
      cardTimers.forEach(clearTimeout);
      clearTimeout(heroButtonTimer);
    };
  }, []);
  const features = [
    {
      title: "Flexible Design",
      icon: <Layers className="w-8 h-8 mb-4 text-indigo-400" />,
      points: [
        "Customizable templates for any world",
        "Procedural generation with rich variety",
        "Environmental modifiers & conditions"
      ],
      description: "Create unique worlds with our flexible template system. From fantasy realms to historical simulations, design environments that evolve dynamically."
    },
    {
      title: "Rich Characters",
      icon: <Users className="w-8 h-8 mb-4 text-emerald-400" />,
      points: [
        "Advanced consciousness simulation",
        "D&D-style attributes & progression",
        "Emergent personalities & relationships"
      ],
      description: "Bring your world to life with NPCs that think, feel, and act autonomously. Watch as they form families, build nations, and create history."
    },
    {
      title: "Template System",
      icon: <Sparkles className="w-8 h-8 mb-4 text-amber-400" />,
      points: [
        "Pre-built world templates",
        "Character & interaction templates",
        "Easy customization & extension"
      ],
      description: "Start quickly with our comprehensive template library. Mix and match elements to create exactly the world you envision."
    }
  ];

  return (
    <>
      {/* Add bounce animation styles */}
      <style>{`
        @keyframes slowBounce {
          0%, 100% {
            transform: translateY(0px);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(-4px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        @keyframes carouselMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-1696px);
          }
        }

        @keyframes carouselMoveWide {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-2296px);
          }
        }

        /* Pause all animations when user prefers reduced motion */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      
      <div 
        className="min-h-screen text-white relative"
        style={{ 
          minHeight: '100vh',
          background: 'transparent' // Let global background show through
        }}
      >
      {/* Use Global Navigation Component */}
      <Navigation />

      {/* Hero Section */}
      <main className="px-8 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 
            className="font-bold mb-6"
            style={{ 
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              lineHeight: '1.1',
              textAlign: 'center',
              opacity: welcomeVisible ? 1 : 0,
              transform: welcomeVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out'
            }}
          >
            <span
              style={{
                background: 'linear-gradient(to right, white, #c7d2fe, #bbf7d0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: welcomeVisible ? 1 : 0,
                transition: 'opacity 0.8s ease-out 0.2s'
              }}
            >
              Welcome!
            </span>
            <br />
            <span
              style={{
                background: 'linear-gradient(to right, #c7d2fe, #bbf7d0, white)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: subtitleVisible ? 1 : 0,
                transform: subtitleVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 1s ease-out, transform 1s ease-out'
              }}
            >
              Build Your Dream World!
            </span>
          </h1>
          <p 
            className="text-xl max-w-3xl mx-auto"
            style={{ 
              color: '#cbd5e1', 
              textAlign: 'center',
              opacity: subtitleVisible ? 1 : 0,
              transform: subtitleVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease-out 0.5s, transform 1s ease-out 0.5s'
            }}
          >
            Create living, breathing worlds with complex histories, autonomous characters, and emergent storytelling.
          </p>
        </div>

        {/* Feature Cards */}
        <div 
          className="mb-16"
          style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem',
            maxWidth: '1400px',
            margin: '0 auto',
            flexWrap: 'wrap'
          }}
        >
          {features.map((feature, index) => (
            <div 
              key={index}
              className="transition-all duration-300 transform hover:-translate-y-1"
              style={{ 
                background: 'rgba(30, 41, 59, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '1rem',
                cursor: 'pointer',
                width: '320px',
                height: '300px',
                display: 'flex',
                flexDirection: 'column',
                flex: 'none',
                padding: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                transform: `translateY(${cardsVisible[index] ? 0 : 60}px)`,
                opacity: cardsVisible[index] ? 1 : 0,
                transition: 'transform 0.8s ease-out, opacity 0.8s ease-out'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.12)';
              }}
            >
              <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                {React.cloneElement(feature.icon, {
                  style: { 
                    width: '2rem', 
                    height: '2rem',
                    color: index === 0 ? '#818cf8' : index === 1 ? '#34d399' : '#fbbf24'
                  }
                })}
              </div>
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: 'white', textAlign: 'center' }}
              >
                {feature.title}
              </h3>
              <ul className="mb-4 flex-1" style={{ fontSize: '0.875rem', lineHeight: '1.5' }}>
                {feature.points.map((point, idx) => (
                  <li key={idx} className="flex items-start mb-2">
                    <ChevronRight 
                      className="mt-1 mr-2 flex-shrink-0"
                      style={{ 
                        color: '#94a3b8',
                        width: '0.875rem',
                        height: '0.875rem'
                      }}
                    />
                    <span style={{ color: '#e2e8f0' }}>{point}</span>
                  </li>
                ))}
              </ul>
              <p 
                className="text-sm leading-relaxed"
                style={{ color: '#94a3b8', lineHeight: '1.4' }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Hero Buttons Section */}
        <div 
          className="text-center"
          style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '4rem', // Add significant top margin to separate from cards
            marginBottom: '6rem', // Add bottom margin before next section
            transform: `translateY(${heroButtonVisible ? 0 : 40}px)`,
            opacity: heroButtonVisible ? 1 : 0,
            transition: 'transform 0.8s ease-out, opacity 0.8s ease-out'
          }}
        >
          {/* Main Action Buttons */}
          <div 
            style={{ 
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '1rem'
            }}
          >
            {/* Create Your World Button */}
            <button 
              onClick={handleCreateWorld}
              className="group relative px-12 py-5 text-lg font-semibold transition-all duration-300"
              style={{ 
                background: 'linear-gradient(to right, #6366f1, #10b981)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '1rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                animation: heroButtonVisible ? 'slowBounce 3s ease-in-out infinite' : 'none'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(to right, #4f46e5, #059669)';
                e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.animation = 'none'; // Stop bounce on hover
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(to right, #6366f1, #10b981)';
                e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                e.target.style.transform = 'scale(1)';
                e.target.style.animation = heroButtonVisible ? 'slowBounce 3s ease-in-out infinite' : 'none'; // Resume bounce
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'scale(1.1)'; // Expand on click
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'scale(1.05)'; // Return to hover scale
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Create Your World
              </span>
            </button>

            {/* Try Demo Button */}
            <button 
              onClick={handleOpenDemoModal}
              className="group relative px-10 py-5 text-lg font-semibold transition-all duration-300"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                borderRadius: '1rem',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(8px)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                e.target.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
                e.target.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'scale(1.08)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'scale(1.05)';
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Play className="w-5 h-5" />
                Try Demo
              </span>
            </button>
          </div>

          {/* Subtitle for buttons */}
          <p 
            className="text-sm"
            style={{ 
              color: '#cbd5e1', 
              opacity: 0.8,
              maxWidth: '600px',
              textAlign: 'center'
            }}
          >
            Build from scratch or explore pre-made worlds to see the engine in action
          </p>
        </div>

        {/* CTA Button - Now hidden since we moved it to hero */}
        <div 
          style={{ display: 'none' }}
        >
          <button 
            onClick={handleCreateWorld}
            className="group relative px-12 py-5 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            style={{ 
              background: 'linear-gradient(to right, #6366f1, #10b981)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '1rem',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'linear-gradient(to right, #4f46e5, #059669)';
              e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'linear-gradient(to right, #6366f1, #10b981)';
              e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span className="relative z-10">Create World</span>
          </button>
        </div>

        {/* Reviews Section */}
        <div 
          className="mt-24 mb-16"
          style={{
            transform: `translateY(${contentVisible.reviews ? 0 : 60}px)`,
            opacity: contentVisible.reviews ? 1 : 0,
            transition: 'transform 1.3s ease-out, opacity 1.3s ease-out'
          }}
        >
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-6"
              style={{ 
                color: 'white',
                textAlign: 'center'
              }}
            >
              What Creators Are Saying
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: '#cbd5e1', textAlign: 'center' }}
            >
              Join thousands of world builders creating amazing stories
            </p>
          </div>

          <div 
            style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto',
              flexWrap: 'wrap'
            }}
          >
            {/* Review 1 */}
            <div 
              className="text-center"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '350px',
                padding: '2rem',
                flex: 'none',
                transform: `translateY(${contentVisible.reviews ? 0 : 40}px)`,
                opacity: contentVisible.reviews ? 1 : 0,
                transition: 'transform 1s ease-out 0.1s, opacity 1s ease-out 0.1s'
              }}
            >
              <div className="mb-4">
                <div style={{ color: '#fbbf24', fontSize: '1.25rem', marginBottom: '1rem' }}>
                  ★★★★★
                </div>
                <p 
                  style={{ 
                    color: '#e2e8f0', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}
                >
                  "This tool has revolutionized my D&D campaigns. The NPCs feel truly alive and my players are constantly surprised by the emergent stories."
                </p>
                <div>
                  <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    Sarah Chen
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Dungeon Master, 8 years
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div 
              className="text-center"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '350px',
                padding: '2rem',
                flex: 'none',
                transform: `translateY(${contentVisible.reviews ? 0 : 50}px)`,
                opacity: contentVisible.reviews ? 1 : 0,
                transition: 'transform 1s ease-out 0.3s, opacity 1s ease-out 0.3s'
              }}
            >
              <div className="mb-4">
                <div style={{ color: '#fbbf24', fontSize: '1.25rem', marginBottom: '1rem' }}>
                  ★★★★★
                </div>
                <p 
                  style={{ 
                    color: '#e2e8f0', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}
                >
                  "As a novelist, this helps me create consistent, believable worlds. Characters develop relationships I never expected, making my stories richer."
                </p>
                <div>
                  <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    Marcus Rodriguez
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Fantasy Author
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div 
              className="text-center"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '350px',
                padding: '2rem',
                flex: 'none',
                transform: `translateY(${contentVisible.reviews ? 0 : 60}px)`,
                opacity: contentVisible.reviews ? 1 : 0,
                transition: 'transform 1s ease-out 0.5s, opacity 1s ease-out 0.5s'
              }}
            >
              <div className="mb-4">
                <div style={{ color: '#fbbf24', fontSize: '1.25rem', marginBottom: '1rem' }}>
                  ★★★★★
                </div>
                <p 
                  style={{ 
                    color: '#e2e8f0', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    marginBottom: '1.5rem'
                  }}
                >
                  "The template system is incredibly flexible. I've created everything from medieval kingdoms to space colonies. Each simulation feels unique."
                </p>
                <div>
                  <p style={{ color: 'white', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    Emma Thompson
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Game Designer
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Combined Features Carousel - How It Works + Additional Features */}
        <div 
          className="mt-32 mb-16"
          style={{
            transform: `translateY(${contentVisible.howItWorks ? 0 : 60}px)`,
            opacity: contentVisible.howItWorks ? 1 : 0,
            transition: 'transform 1.3s ease-out, opacity 1.3s ease-out'
          }}
        >
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-bold mb-6"
              style={{ 
                color: 'white',
                textAlign: 'center'
              }}
            >
              How It Works
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: '#cbd5e1', textAlign: 'center' }}
            >
              Create immersive worlds in three simple steps
            </p>
          </div>

          {/* Carousel Container */}
          <div 
            style={{ 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              maxWidth: '1400px',
              margin: '0 auto',
              overflow: 'hidden',
              position: 'relative',
              height: '400px'
            }}
          >
            <div 
              style={{
                display: 'flex',
                gap: '2rem',
                animationName: contentVisible.howItWorks ? 'carouselMove' : 'none',
                animationDuration: contentVisible.howItWorks ? '30s' : '0s',
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationPlayState: 'running',
                willChange: 'transform'
              }}
              className="carousel-container"
            >
              {/* Card 1: Design Your World + Historical Simulation */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #818cf8, #34d399)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  1
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Design Your World
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Use our flexible template system to create the foundation of your world. Define rules, environment, and watch civilizations rise and fall through procedurally generated history.
                </p>
              </div>

              {/* Card 2: Populate & Connect + Emergent Stories */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #34d399, #fbbf24)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  2
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Populate & Connect
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Add characters with unique personalities and create settlements. Build the social fabric that drives emergent storytelling and creates memorable narratives.
                </p>
              </div>

              {/* Card 3: Watch History Unfold + Dynamic Geography */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #fbbf24, #818cf8)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  3
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Watch History Unfold
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Launch your simulation and observe as settlements grow organically based on resources. Characters make decisions and history writes itself.
                </p>
              </div>

              {/* Card 4: Analyze & Interact */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #f59e0b, #10b981)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  4
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Analyze & Interact
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Dive deep into your world's data with analytics tools. Interact with characters, influence events, and guide the evolution of your civilization.
                </p>
              </div>

              {/* Card 5: Export & Share */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  5
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Export & Share
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Export your world data, generate reports, and share your creations with the community. Perfect for D&D campaigns and storytelling projects.
                </p>
              </div>

              {/* Spacer for visual separation */}
              <div style={{ width: '200px', flex: 'none' }} />

              {/* Second set of cards for seamless loop */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #818cf8, #34d399)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  1
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Design Your World
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Use our flexible template system to create the foundation of your world. Define rules, environment, and watch civilizations rise and fall through procedurally generated history.
                </p>
              </div>

              {/* Duplicate card 2 for seamless loop */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #34d399, #fbbf24)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  2
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Populate & Connect
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Add characters with unique personalities and create settlements. Build the social fabric that drives emergent storytelling and creates memorable narratives.
                </p>
              </div>

              {/* Duplicate card 3 for seamless loop */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #fbbf24, #818cf8)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  3
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Watch History Unfold
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Launch your simulation and observe as settlements grow organically based on resources. Characters make decisions and history writes itself.
                </p>
              </div>

              {/* Duplicate card 4 for seamless loop */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #f59e0b, #10b981)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  4
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Analyze & Interact
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Dive deep into your world's data with analytics tools. Interact with characters, influence events, and guide the evolution of your civilization.
                </p>
              </div>

              {/* Duplicate card 5 for seamless loop */}
              <div 
                className="carousel-card transition-all duration-500"
                style={{
                  background: 'rgba(30, 41, 59, 0.4)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '1rem',
                  width: '280px',
                  height: '360px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flex: 'none',
                  padding: '2rem',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                  transformOrigin: 'center',
                  transition: 'all 0.5s ease-out'
                }}
                onMouseOver={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'paused';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                  e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
                }}
              >
                <div 
                  className="mx-auto mb-6 flex items-center justify-center"
                  style={{
                    width: '4rem',
                    height: '4rem',
                    background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                    borderRadius: '50%',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  5
                </div>
                <h3 
                  className="text-xl font-bold mb-4"
                  style={{ color: 'white', textAlign: 'center' }}
                >
                  Export & Share
                </h3>
                <p 
                  style={{ 
                    color: '#cbd5e1', 
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    textAlign: 'center'
                  }}
                >
                  Export your world data, generate reports, and share your creations with the community. Perfect for D&D campaigns and storytelling projects.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features - Carousel */}
        <div 
          className="mt-24"
          style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '1400px',
            margin: '6rem auto 0',
            transform: `translateY(${contentVisible.additionalFeatures ? 0 : 70}px)`,
            opacity: contentVisible.additionalFeatures ? 1 : 0,
            transition: 'transform 1.4s ease-out, opacity 1.4s ease-out',
            overflow: 'hidden',
            position: 'relative',
            height: '280px'
          }}
        >
          {/* Carousel Container */}
          <div 
            style={{
              display: 'flex',
              gap: '2rem',
              animationName: contentVisible.additionalFeatures ? 'carouselMoveWide' : 'none',
              animationDuration: contentVisible.additionalFeatures ? '28s' : '0s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationPlayState: 'running'
            }}
            className="carousel-container"
          >
            {/* Card 1: Historical Simulation + Dynamic Geography */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Clock 
                className="mx-auto mb-4"
                style={{ 
                  color: '#818cf8',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Historical Simulation
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Watch civilizations rise and fall through procedurally generated history. Settlements grow organically based on resources and environment.
              </p>
            </div>

            {/* Card 2: Emergent Stories + Rich Characters */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Sparkles 
                className="mx-auto mb-4"
                style={{ 
                  color: '#34d399',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Emergent Stories
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Every simulation creates unique narratives and memorable characters. NPCs develop relationships, form alliances, and create unexpected plot twists.
              </p>
            </div>

            {/* Card 3: Template System + Flexible Design */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Map 
                className="mx-auto mb-4"
                style={{ 
                  color: '#fbbf24',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Flexible Templates
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Customizable templates for any world type. From fantasy realms to sci-fi colonies, create and modify templates to match your vision perfectly.
              </p>
            </div>

            {/* Card 4: Data Analytics */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Database 
                className="mx-auto mb-4"
                style={{ 
                  color: '#06b6d4',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Data Analytics
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Deep insights into population growth, economic trends, and social dynamics. Track the evolution of your civilization with comprehensive analytics.
              </p>
            </div>

            {/* Card 5: Security & Privacy */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Shield 
                className="mx-auto mb-4"
                style={{ 
                  color: '#ef4444',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Security & Privacy
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Your worlds are securely stored with enterprise-grade encryption. Share publicly or keep private - you control who sees your creations.
              </p>
            </div>

            {/* Card 6: Community & Sharing */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Share2 
                className="mx-auto mb-4"
                style={{ 
                  color: '#8b5cf6',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Community & Sharing
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Join a thriving community of world builders. Share your creations, discover new templates, and collaborate on epic storytelling projects.
              </p>
            </div>

            {/* Spacer for visual separation */}
            <div style={{ width: '200px', flex: 'none' }} />

            {/* Second set of cards for seamless loop */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Clock 
                className="mx-auto mb-4"
                style={{ 
                  color: '#818cf8',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Historical Simulation
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Watch civilizations rise and fall through procedurally generated history. Settlements grow organically based on resources and environment.
              </p>
            </div>

            {/* Duplicate card 2 for seamless loop */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Sparkles 
                className="mx-auto mb-4"
                style={{ 
                  color: '#34d399',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Emergent Stories
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Every simulation creates unique narratives and memorable characters. NPCs develop relationships, form alliances, and create unexpected plot twists.
              </p>
            </div>

            {/* Duplicate card 3 for seamless loop */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Map 
                className="mx-auto mb-4"
                style={{ 
                  color: '#fbbf24',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Flexible Templates
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Customizable templates for any world type. From fantasy realms to sci-fi colonies, create and modify templates to match your vision perfectly.
              </p>
            </div>

            {/* Duplicate card 4 for seamless loop */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Database 
                className="mx-auto mb-4"
                style={{ 
                  color: '#06b6d4',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Data Analytics
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Deep insights into population growth, economic trends, and social dynamics. Track the evolution of your civilization with comprehensive analytics.
              </p>
            </div>

            {/* Duplicate card 5 for seamless loop */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Shield 
                className="mx-auto mb-4"
                style={{ 
                  color: '#ef4444',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Security & Privacy
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Your worlds are securely stored with enterprise-grade encryption. Share publicly or keep private - you control who sees your creations.
              </p>
            </div>

            {/* Duplicate card 6 for seamless loop */}
            <div 
              className="carousel-card transition-all duration-500"
              style={{
                background: 'rgba(30, 41, 59, 0.4)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(71, 85, 105, 0.3)',
                borderRadius: '1rem',
                width: '400px',
                height: '240px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                flex: 'none',
                padding: '2rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                transformOrigin: 'center',
                transition: 'all 0.5s ease-out'
              }}
              onMouseOver={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'paused';
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = 'rgba(129, 140, 248, 0.5)';
                e.currentTarget.style.boxShadow = '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 40px rgba(129, 140, 248, 0.2)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = 'rgba(30, 41, 59, 0.4)';
              }}
            >
              <Share2 
                className="mx-auto mb-4"
                style={{ 
                  color: '#8b5cf6',
                  width: '3rem',
                  height: '3rem'
                }}
              />
              <h4 
                className="font-bold mb-4"
                style={{ color: 'white', fontSize: '1.5rem', textAlign: 'center' }}
              >
                Community & Sharing
              </h4>
              <p 
                style={{ 
                  color: '#cbd5e1', 
                  fontSize: '1rem',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}
              >
                Join a thriving community of world builders. Share your creations, discover new templates, and collaborate on epic storytelling projects.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="mt-16 py-12 border-t"
        style={{ 
          borderColor: 'rgba(71, 85, 105, 0.3)',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem', marginBottom: '3rem' }}>
            
            {/* Company Info */}
            <div style={{ flex: '1', minWidth: '280px' }}>
              <div className="flex items-center space-x-3 mb-6">
                <Globe className="w-8 h-8" style={{ color: '#818cf8' }} />
                <span 
                  className="text-2xl font-bold"
                  style={{ 
                    background: 'linear-gradient(to right, #818cf8, #34d399)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  World Builder
                </span>
              </div>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1rem' }}>
                Create living, breathing worlds with complex histories, autonomous characters, and emergent storytelling.
              </p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                © 2025 World Builder. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ flex: '1', minWidth: '200px' }}>
              <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a href="#features" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }}
                     onMouseOver={(e) => e.target.style.color = 'white'}
                     onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                    Features
                  </a>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a href="#how-it-works" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }}
                     onMouseOver={(e) => e.target.style.color = 'white'}
                     onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                    How It Works
                  </a>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a href="#reviews" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }}
                     onMouseOver={(e) => e.target.style.color = 'white'}
                     onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                    Reviews
                  </a>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <a href="#documentation" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }}
                     onMouseOver={(e) => e.target.style.color = 'white'}
                     onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Section */}
            <div style={{ flex: '1', minWidth: '280px' }}>
              <h4 style={{ color: 'white', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Get In Touch
              </h4>
              <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Have questions or need support? We'd love to hear from you.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail style={{ color: '#818cf8', width: '1.25rem', height: '1.25rem' }} />
                  <a href="mailto:support@worldbuilder.com" 
                     style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }}
                     onMouseOver={(e) => e.target.style.color = 'white'}
                     onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                    support@worldbuilder.com
                  </a>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MessageSquare style={{ color: '#34d399', width: '1.25rem', height: '1.25rem' }} />
                  <button
                     style={{ 
                       color: '#cbd5e1', 
                       background: 'none', 
                       border: 'none', 
                       cursor: 'pointer',
                       textDecoration: 'none', 
                       transition: 'color 0.3s',
                       padding: 0,
                       font: 'inherit'
                     }}
                     onMouseOver={(e) => e.target.style.color = 'white'}
                     onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                    Live Chat Support
                  </button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Phone style={{ color: '#fbbf24', width: '1.25rem', height: '1.25rem' }} />
                  <a href="tel:+1-555-WORLD-01" 
                     style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.3s' }}
                     onMouseOver={(e) => e.target.style.color = 'white'}
                     onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>
                    +1 (555) WORLD-01
                  </a>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  <strong style={{ color: '#94a3b8' }}>Support Hours:</strong><br />
                  Monday - Friday: 9AM - 6PM EST<br />
                  Weekend: 10AM - 4PM EST
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-6 border-t" style={{ borderColor: 'rgba(71, 85, 105, 0.3)' }}>
            <p 
              className="text-lg"
              style={{ color: '#94a3b8' }}
            >
              Ready to build your world? • Start creating in seconds
            </p>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <DemoModal 
        isOpen={isDemoModalOpen}
        onClose={handleCloseDemoModal}
        onSelectDemo={handleSelectDemo}
        onImportDemo={handleImportDemo}
      />
    </div>
    </>
  );
};

export default WorldBuilderLandingPage;