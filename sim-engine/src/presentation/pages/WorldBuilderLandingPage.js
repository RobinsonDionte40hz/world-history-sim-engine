/**
 * WorldBuilderLandingPage - Welcome landing page for world building
 * 
 * Provides a welcoming entry point to the world builder with a single
 * prominent "Create World" button, moving away from the rigid 6-step process.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Globe, Users, Layers, Sparkles, Clock, Map, Mail, MessageSquare, Phone } from 'lucide-react';
import { Navigation } from '../UI';

const WorldBuilderLandingPage = ({ onCreateWorld }) => {
  const navigate = useNavigate();
  
  // Handle create world action - direct users to creation tools
  const handleCreateWorld = () => {
    if (onCreateWorld) {
      onCreateWorld();
    } else {
      // Direct users to Node Editor as a good starting point for world creation
      navigate('/editors/nodes');
    }
  };
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState([false, false, false]);
  const [heroButtonVisible, setHeroButtonVisible] = useState(false);

  const [contentVisible, setContentVisible] = useState({
    cta: false,
    howItWorks: false,
    enhancedFeatures: false,
    useCases: false,
    stats: false,
    enhancedTestimonials: false,
    finalCta: false
  });
  const [contentFadedOut, setContentFadedOut] = useState(false);

  // Handle scroll for content visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Increased fadeout threshold to prevent premature disappearing
      const fadeOutThreshold = windowHeight * 8; // Much higher threshold
      
      // Check if user has scrolled past the fadeout threshold
      if (scrollPosition > fadeOutThreshold) {
        setContentFadedOut(true);
      } else {
        setContentFadedOut(false);
        
        // Trigger visibility based on scroll position with more granular thresholds
        setContentVisible({
          cta: scrollPosition > windowHeight * 0.2,
          howItWorks: scrollPosition > windowHeight * 0.7,
          enhancedFeatures: scrollPosition > windowHeight * 1.2,
          useCases: scrollPosition > windowHeight * 1.8,
          stats: scrollPosition > windowHeight * 2.4,
          enhancedTestimonials: scrollPosition > windowHeight * 3.0,
          finalCta: scrollPosition > windowHeight * 3.6
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
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
            transform: translateY(-10px);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        @keyframes carouselMove {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-920px);
          }
        }
        

      `}</style>
      
      <div 
        className="min-h-screen text-white relative"
        style={{ 
          minHeight: '100vh',
          background: 'transparent', // Let global background show through
          opacity: contentFadedOut ? 0 : 1,
          transform: contentFadedOut ? 'translateY(-50px)' : 'translateY(0)',
          transition: 'opacity 1s ease-out, transform 1s ease-out'
        }}
      >
      {/* Navigation */}
      <Navigation 
        title="World History Simulation Engine"
        navItems={[
          { label: 'Features', onClick: () => navigate('/features') },
          { label: 'Documentation', onClick: () => navigate('/docs') },
          { label: 'Examples', onClick: () => navigate('/examples') }
        ]}
        menuItems={[
          {
            id: 'builder',
            label: '🏗️ World Builder',
            onClick: () => navigate('/builder'),
            hoverColor: 'rgba(129, 140, 248, 0.1)',
            hoverBorder: 'rgba(129, 140, 248, 0.3)'
          },
          {
            id: 'simulation',
            label: '🌍 Simulation',
            onClick: () => navigate('/simulation'),
            hoverColor: 'rgba(52, 211, 153, 0.1)',
            hoverBorder: 'rgba(52, 211, 153, 0.3)'
          },
          {
            id: 'examples',
            label: '📚 Examples',
            onClick: () => navigate('/examples'),
            hoverColor: 'rgba(251, 191, 36, 0.1)',
            hoverBorder: 'rgba(251, 191, 36, 0.3)'
          },
          {
            id: 'docs',
            label: '📖 Documentation',
            onClick: () => navigate('/docs'),
            hoverColor: 'rgba(168, 85, 247, 0.1)',
            hoverBorder: 'rgba(168, 85, 247, 0.3)'
          },
          {
            id: 'features',
            label: '✨ Features',
            onClick: () => navigate('/features'),
            hoverColor: 'rgba(239, 68, 68, 0.1)',
            hoverBorder: 'rgba(239, 68, 68, 0.3)'
          }
        ]}
      />

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

        {/* Hero Create World Button */}
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
            <span className="relative z-10">Create Your World</span>
          </button>
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
                animation: contentVisible.howItWorks ? 'carouselMove 18s linear infinite' : 'none',
                animationPlayState: 'running'
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
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
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
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
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
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
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

              {/* Duplicate cards for seamless loop */}
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
                  e.currentTarget.style.transform = 'scale(1.15)';
                  e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                  e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseOut={(e) => {
                  const container = e.currentTarget.closest('.carousel-container');
                  container.style.animationPlayState = 'running';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.zIndex = '1';
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
              animation: contentVisible.additionalFeatures ? 'carouselMove 15s linear infinite' : 'none',
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
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.width = '480px';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.width = '400px';
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
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.width = '480px';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.width = '400px';
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
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.width = '480px';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.width = '400px';
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

            {/* Duplicate cards for seamless loop */}
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
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.6)';
                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.25)';
                e.currentTarget.style.width = '480px';
              }}
              onMouseOut={(e) => {
                const container = e.currentTarget.closest('.carousel-container');
                container.style.animationPlayState = 'running';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.3)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.width = '400px';
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
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div 
          className="mt-32 mb-16"
          style={{
            transform: `translateY(${contentVisible.enhancedFeatures ? 0 : 60}px)`,
            opacity: contentVisible.enhancedFeatures ? 1 : 0,
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
              Powerful Features for Dynamic Worlds
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: '#cbd5e1', textAlign: 'center' }}
            >
              Everything you need to create immersive, living worlds
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                title: "Complex Character Systems",
                description: "NPCs with consciousness, personalities, and D&D attributes that drive authentic behavior and decision-making."
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: "Dynamic World Generation",
                description: "Create living, breathing historical worlds with settlements that evolve and civilizations that rise and fall."
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Emergent Storytelling",
                description: "Watch as characters create their own stories through interactions, relationships, and historical events."
              },
              {
                icon: <Layers className="w-8 h-8" />,
                title: "Template System",
                description: "Flexible content creation framework for rapid world building and scenario development."
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800/70 transition-all duration-500 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transform hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: contentVisible.enhancedFeatures ? 1 : 0,
                  transform: contentVisible.enhancedFeatures ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <div className="text-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div 
          className="mt-32 mb-16 bg-slate-900/50 -mx-8 px-8 py-16"
          style={{
            transform: `translateY(${contentVisible.useCases ? 0 : 60}px)`,
            opacity: contentVisible.useCases ? 1 : 0,
            transition: 'transform 1.3s ease-out, opacity 1.3s ease-out'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 
                className="text-4xl font-bold mb-6"
                style={{ 
                  color: 'white',
                  textAlign: 'center'
                }}
              >
                Built for Creators and Researchers
              </h2>
              <p 
                className="text-xl max-w-2xl mx-auto"
                style={{ color: '#cbd5e1', textAlign: 'center' }}
              >
                Trusted by game developers, writers, educators, and researchers worldwide
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Game Development",
                  description: "Procedural world generation and dynamic storytelling for immersive gaming experiences.",
                  action: () => navigate('/examples')
                },
                {
                  title: "Creative Writing",
                  description: "Historical fiction and fantasy world creation with rich character development.",
                  action: () => navigate('/examples')
                },
                {
                  title: "Education",
                  description: "Interactive historical simulations for engaging learning experiences.",
                  action: () => navigate('/docs')
                },
                {
                  title: "Research",
                  description: "Social dynamics and civilization modeling for academic and scientific study.",
                  action: () => navigate('/docs')
                }
              ].map((useCase, index) => (
                <div
                  key={index}
                  className="p-8 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1 hover:shadow-lg"
                  onClick={useCase.action}
                >
                  <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-indigo-400 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    {useCase.description}
                  </p>
                  <div className="flex items-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <span className="text-sm font-medium">Learn more</span>
                    <ChevronRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div 
          className="mt-32 mb-16"
          style={{
            transform: `translateY(${contentVisible.stats ? 0 : 60}px)`,
            opacity: contentVisible.stats ? 1 : 0,
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
              Trusted by Creators Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "10,000+", label: "Worlds Created" },
              { number: "50,000+", label: "Characters Simulated" },
              { number: "1M+", label: "Historical Events" },
              { number: "500+", label: "Active Users" }
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center"
                style={{
                  opacity: contentVisible.stats ? 1 : 0,
                  transform: contentVisible.stats ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.7s ease-out ${index * 0.1}s`
                }}
              >
                <div className="text-3xl font-bold text-indigo-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-300 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Testimonials Section */}
        <div 
          className="mt-32 mb-16"
          style={{
            transform: `translateY(${contentVisible.enhancedTestimonials ? 0 : 60}px)`,
            opacity: contentVisible.enhancedTestimonials ? 1 : 0,
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
              What Our Users Say
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: '#cbd5e1', textAlign: 'center' }}
            >
              Real feedback from creators using our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Chen",
                role: "Game Developer",
                company: "Indie Studios",
                content: "The character consciousness system is incredible. NPCs feel truly alive and make decisions that surprise even me as the developer.",
                rating: 5,
                avatar: "SC"
              },
              {
                name: "Dr. Michael Rodriguez",
                role: "History Professor",
                company: "University of California",
                content: "I use this for teaching medieval history. Students are engaged like never before, watching civilizations rise and fall in real-time.",
                rating: 5,
                avatar: "MR"
              },
              {
                name: "Emma Thompson",
                role: "Fantasy Author",
                company: "Freelance Writer",
                content: "This tool has revolutionized my worldbuilding process. The emergent storytelling gives me ideas I never would have thought of.",
                rating: 5,
                avatar: "ET"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 transform hover:-translate-y-1 transition-all duration-300"
                style={{
                  opacity: contentVisible.enhancedTestimonials ? 1 : 0,
                  transform: contentVisible.enhancedTestimonials ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.8s ease-out ${index * 0.2}s`
                }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">★</span>
                  ))}
                </div>
                
                <blockquote className="text-slate-200 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {testimonial.name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div 
          className="mt-32 mb-16 text-center bg-slate-900/30 -mx-8 px-8 py-20"
          style={{
            transform: `translateY(${contentVisible.finalCta ? 0 : 60}px)`,
            opacity: contentVisible.finalCta ? 1 : 0,
            transition: 'transform 1.3s ease-out, opacity 1.3s ease-out'
          }}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Create Your World?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Start building dynamic historical worlds with complex characters and emergent narratives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleCreateWorld}
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/25"
              >
                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                Launch World Builder
              </button>
              
              <button
                onClick={() => navigate('/docs')}
                className="group flex items-center gap-2 px-8 py-4 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-300 hover:bg-slate-800/50"
              >
                View Documentation
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
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
    </div>
    </>
  );
};

export default WorldBuilderLandingPage;