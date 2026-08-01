import React, { useEffect, useState, useRef } from 'react';

// Cat states for timeline
enum CatState {
  WALKING_1 = 'walking_1',
  PAUSED_1 = 'paused_1',
  WALKING_2 = 'walking_2',
  PAUSED_2 = 'paused_2',
  WALKING_3 = 'walking_3',
  ANTICIPATING = 'anticipating',
  FALLING = 'falling',
  LANDED = 'landed',
  SITTING = 'sitting',
  IDLE_WALKING = 'idle_walking',
  JUMPING_UP = 'jumping_up',
  JUMPING_DOWN = 'jumping_down',
}

interface WalkingCatProps {
  theme: 'dark' | 'light';
}

export const WalkingCat: React.FC<WalkingCatProps> = ({ theme }) => {
  const [catState, setCatState] = useState<CatState>(CatState.WALKING_1);
  const [posX, setPosX] = useState(-15); // Percentage of container width
  const [posY, setPosY] = useState(-0.35); // Em units relative to h1 font-size
  const [rotation, setRotation] = useState(0); // Degrees
  const [scaleY, setScaleY] = useState(1); // Squash/stretch
  const [scaleX, setScaleX] = useState(1); // Cat direction (1 for right, -1 for left)
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [dustParticles, setDustParticles] = useState<{ id: number; dx: number; dy: number }[]>([]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [targetPosX, setTargetPosX] = useState<number | null>(null);

  // Keep track of current X in a ref so we can read it without re-triggering the useEffect
  const posXRef = useRef(posX);
  useEffect(() => {
    posXRef.current = posX;
  }, [posX]);

  // Sound/Vibe click reactions
  const clickPhrases = [
    'meow?',
    'purr...',
    'feed me',
    'nice code',
    'Hire my human!',
    'zZz...',
    'boop!',
    'staring contest?',
    'watch out below!',
    '*flicks tail*',
  ];

  // Random speech bubble lines on page load
  const pause2Phrases = [
    'psst...',
    'nice site!',
    'clean design.',
    'watch out—',
    'so smooth...',
  ];

  const pause2TextRef = useRef('psst...');

  // Animation frame toggler for walk cycle
  const [walkFrame, setWalkFrame] = useState(0);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Select pause 2 phrase once on load
    pause2TextRef.current = pause2Phrases[Math.floor(Math.random() * pause2Phrases.length)];

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    // Session-based checking so it doesn't walk/fall on every tiny state re-trigger if not wanted,
    // but a soft load trigger is fine. Let's use sessionStorage to only walk/fall once per session.
    const hasWalked = sessionStorage.getItem('portfolio_cat_has_walked');

    if (mediaQuery.matches || hasWalked === 'true') {
      // Skip straight to sitting on "Kellas Andrei"
      setCatState(CatState.SITTING);
      setPosX(32); // Lands around 32% of the way across
      setPosY(0.73); // Directly sitting on second line
    }
  }, []);

  // Walk cycle frame updater (runs while walking)
  useEffect(() => {
    if (
      catState === CatState.WALKING_1 ||
      catState === CatState.WALKING_2 ||
      catState === CatState.WALKING_3 ||
      catState === CatState.IDLE_WALKING
    ) {
      const interval = setInterval(() => {
        setWalkFrame((prev) => (prev === 0 ? 1 : 0));
      }, 180);
      return () => clearInterval(interval);
    }
  }, [catState]);

  // Idle walking trigger: when sitting, periodically choose a target and start walking or jumping
  useEffect(() => {
    if (catState !== CatState.SITTING || isJumping) return;

    // Pick a time between 4 and 8 seconds to start walking or jumping
    const delay = 4000 + Math.random() * 4000;
    const timeoutId = setTimeout(() => {
      const currentX = posXRef.current;
      const isTopLevel = posY < 0;

      // 40% chance to jump/climb between levels, 60% chance to walk horizontally
      const shouldChangeLevel = Math.random() < 0.40;

      if (shouldChangeLevel) {
        if (isTopLevel) {
          setCatState(CatState.JUMPING_DOWN);
        } else {
          setCatState(CatState.JUMPING_UP);
        }
      } else {
        // Choose a target position that is at least 15% away from current position to make the walk look real
        let newTarget = 5 + Math.random() * 80;
        for (let i = 0; i < 5; i++) {
          if (Math.abs(newTarget - currentX) > 15) break;
          newTarget = 5 + Math.random() * 80;
        }

        setTargetPosX(newTarget);
        setScaleX(newTarget > currentX ? 1 : -1);
        setCatState(CatState.IDLE_WALKING);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [catState, posY, isJumping]);

  // Idle walking movement loop
  useEffect(() => {
    if (catState !== CatState.IDLE_WALKING || targetPosX === null || isJumping) return;

    let animFrameId: number;
    const speed = 0.15; // Percent per frame (~4-9% per second)

    const updateMovement = () => {
      setPosX((currentX) => {
        const diff = targetPosX - currentX;
        const direction = Math.sign(diff);
        const step = direction * speed;

        if (Math.abs(diff) <= Math.abs(step)) {
          // Reached target, sit down and clear target
          setCatState(CatState.SITTING);
          setTargetPosX(null);
          return targetPosX;
        }

        return currentX + step;
      });

      animFrameId = requestAnimationFrame(updateMovement);
    };

    animFrameId = requestAnimationFrame(updateMovement);
    return () => cancelAnimationFrame(animFrameId);
  }, [catState, targetPosX, isJumping]);

  // Jumping/Climbing movement loop
  useEffect(() => {
    if (
      (catState !== CatState.JUMPING_UP && catState !== CatState.JUMPING_DOWN) ||
      isJumping
    ) {
      return;
    }

    const startX = posXRef.current;
    const isUp = catState === CatState.JUMPING_UP;
    const startY = isUp ? 0.73 : -0.35;
    const endY = isUp ? -0.35 : 0.73;

    // Pick a random target X position on the other level
    let targetX = 10 + Math.random() * 70; // Bounded nicely in the center area 10% - 80%
    const maxJumpDistance = 25;
    const diffX = Math.min(Math.max(targetX - startX, -maxJumpDistance), maxJumpDistance);
    targetX = Math.min(Math.max(startX + diffX, 5), 85);

    // Set face direction
    setScaleX(targetX > startX ? 1 : -1);

    // Give a nice bubble text of preparation
    setBubbleText(isUp ? '*wiggles*' : '*peeks*');

    // Anticipation phase (crouch)
    let animationFrameId: number;
    let phaseStartTime: number;

    const runCrouch = (timestamp: number) => {
      if (!phaseStartTime) phaseStartTime = timestamp;
      const elapsed = timestamp - phaseStartTime;
      const duration = 350; // 350ms crouch

      const progress = Math.min(elapsed / duration, 1);
      setScaleY(1 - progress * 0.35); // Crouch squash down to 0.65

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(runCrouch);
      } else {
        // Start the actual leap!
        phaseStartTime = 0; // reset
        setBubbleText(isUp ? 'parkour!' : 'leap!');
        requestAnimationFrame(runLeap);
      }
    };

    const runLeap = (timestamp: number) => {
      if (!phaseStartTime) phaseStartTime = timestamp;
      const elapsed = timestamp - phaseStartTime;
      const duration = isUp ? 650 : 500; // Jump up is slightly longer

      const progress = Math.min(elapsed / duration, 1);

      // Linear X position
      const currentX = startX + (targetX - startX) * progress;
      setPosX(currentX);

      // Parabolic Y position
      const jumpHeight = isUp ? 0.75 : 0.38;
      const currentY = (1 - progress) * startY + progress * endY - Math.sin(progress * Math.PI) * jumpHeight;
      setPosY(currentY);

      // Rotation effect: tilt body upward during ascent, downward during descent
      const maxTilt = isUp ? 22 : 12;
      const direction = targetX > startX ? 1 : -1;
      let tilt = 0;
      if (progress < 0.5) {
        // Ascending: tilt upward
        const factor = progress / 0.5; // 0 to 1
        tilt = direction * factor * maxTilt;
      } else {
        // Descending: tilt downward
        const factor = (1 - progress) / 0.5; // 1 to 0
        tilt = direction * factor * maxTilt;
      }
      setRotation(tilt);

      // Stretch body in flight
      setScaleY(1.25);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(runLeap);
      } else {
        // Landing effect!
        setRotation(0);
        setPosX(targetX);
        setPosY(endY);
        setCatState(CatState.LANDED);
        setScaleY(0.45); // Squash hard!

        // Landing bubbles and particles
        const landPhrases = isUp ? ['ta-da!', 'hup!', 'climbing!'] : ['oof!', 'thud!', 'splat!'];
        setBubbleText(landPhrases[Math.floor(Math.random() * landPhrases.length)]);

        // Generate dust particles on landing
        setDustParticles([
          { id: Date.now() + 1, dx: -18, dy: -4 },
          { id: Date.now() + 2, dx: 0, dy: -14 },
          { id: Date.now() + 3, dx: 18, dy: -4 },
        ]);

        // Recover from squash-and-stretch
        setTimeout(() => {
          setScaleY(1.2);
          setTimeout(() => {
            setScaleY(1);
            setCatState(CatState.SITTING);
            setDustParticles([]);
            // Clear bubble shortly after
            setTimeout(() => {
              setBubbleText(null);
            }, 1000);
          }, 140);
        }, 140);
      }
    };

    // Kickoff the jump crouch phase
    animationFrameId = requestAnimationFrame(runCrouch);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [catState, isJumping]);

  // Timed state-machine sequence for walking and falling
  useEffect(() => {
    if (prefersReducedMotion || sessionStorage.getItem('portfolio_cat_has_walked') === 'true') {
      return;
    }

    let timeouts: number[] = [];
    const registerTimeout = (fn: () => void, delay: number) => {
      const id = window.setTimeout(fn, delay);
      timeouts.push(id);
    };

    // 1. Initial State (Spawned walking)
    setPosX(-15);
    setPosY(-0.35);
    setRotation(0);

    // Smooth position updating using requestAnimationFrame (for frame-by-frame drift)
    let animationFrameId: number;
    let startTimestamp: number | null = null;

    const animateMovement = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;

      // We handle walking states by updating X smoothly
      setCatState((current) => {
        if (current === CatState.WALKING_1) {
          // Walk from -15 to 16% over 2200ms
          const progress = Math.min(elapsed / 2200, 1);
          setPosX(-15 + progress * 31); // ends at 16
        } else if (current === CatState.WALKING_2) {
          // Walk from 16 to 48% over 2000ms
          const progress = Math.min((elapsed - 3700) / 2000, 1);
          if (progress >= 0) {
            setPosX(16 + progress * 32); // ends at 48
          }
        } else if (current === CatState.WALKING_3) {
          // Walk from 48 to 32% (actually, we can turn around and walk back or walk forward to 32% on line 1, wait!)
          // Let's have it walk to 32% directly.
          // Wait, if it walks to 32% from 48%, it has to turn left (scaleX = -1)!
          const progress = Math.min((elapsed - 7200) / 1000, 1);
          if (progress >= 0) {
            setScaleX(-1); // Face left to go backward!
            setPosX(48 - progress * 16); // ends at 32
          }
        } else if (current === CatState.ANTICIPATING) {
          setScaleX(1); // Turn back right or look forward in shock
        }
        return current;
      });

      animationFrameId = requestAnimationFrame(animateMovement);
    };

    // Begin drift animation loop
    animationFrameId = requestAnimationFrame(animateMovement);

    // Timelines
    // Walk 1 ends at 2200ms -> Pause 1
    registerTimeout(() => {
      setCatState(CatState.PAUSED_1);
      setBubbleText('hey!');
    }, 2200);

    // Pause 1 ends at 3700ms -> Walk 2
    registerTimeout(() => {
      setBubbleText(null);
      setCatState(CatState.WALKING_2);
    }, 3700);

    // Walk 2 ends at 5700ms -> Pause 2
    registerTimeout(() => {
      setCatState(CatState.PAUSED_2);
      setBubbleText(pause2TextRef.current);
    }, 5700);

    // Pause 2 ends at 7200ms -> Walk 3 (backward walk to 32% above KELLAS)
    registerTimeout(() => {
      setBubbleText(null);
      setCatState(CatState.WALKING_3);
    }, 7200);

    // Walk 3 ends at 8200ms -> Anticipate wobble
    registerTimeout(() => {
      setCatState(CatState.ANTICIPATING);
      setScaleX(1); // Face right
      setBubbleText('whoa!');
    }, 8200);

    // Anticipate ends at 8900ms -> Fall!
    registerTimeout(() => {
      setBubbleText(null);
      setCatState(CatState.FALLING);
    }, 8900);

    // Fall logic (we can animate this via requestAnimationFrame or CSS, let's use a timer and manual state)
    let fallStartTime: number;
    const animateFall = (timestamp: number) => {
      if (!fallStartTime) fallStartTime = timestamp;
      const elapsed = timestamp - fallStartTime;
      const duration = 400; // 400ms fall duration

      const progress = Math.min(elapsed / duration, 1);

      // Gravity curve (ease-in-quad)
      const easeInQuad = progress * progress;

      setPosY(-0.35 + easeInQuad * 1.08); // Ends at 0.73em
      setRotation(easeInQuad * 360); // Full rotating fall!

      if (progress < 1) {
        requestAnimationFrame(animateFall);
      } else {
        // LANDING EFFECT!
        setCatState(CatState.LANDED);
        setRotation(0);
        setPosY(0.73); // Securely set landing vertical height
        setScaleY(0.5); // Squash!

        // Trigger dust/thud particles
        setDustParticles([
          { id: 1, dx: -15, dy: -5 },
          { id: 2, dx: 0, dy: -12 },
          { id: 3, dx: 15, dy: -5 },
        ]);

        // Mark cat as walked in session so it stays sitting on page refreshes
        sessionStorage.setItem('portfolio_cat_has_walked', 'true');

        // Restore scale back up (stretch)
        setTimeout(() => {
          setScaleY(1.2);
          setTimeout(() => {
            setScaleY(1);
            setCatState(CatState.SITTING);
            setDustParticles([]);
          }, 150);
        }, 150);
      }
    };

    registerTimeout(() => {
      requestAnimationFrame(animateFall);
    }, 8900);

    return () => {
      timeouts.forEach((id) => clearTimeout(id));
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  // Click interaction: jumps up and displays a cute remark
  const handleCatClick = () => {
    if (
      isJumping ||
      catState === CatState.FALLING ||
      catState === CatState.JUMPING_UP ||
      catState === CatState.JUMPING_DOWN ||
      catState === CatState.LANDED
    ) {
      return;
    }

    setIsJumping(true);
    const originalY = posY;

    // Trigger random remark
    const randomPhrase = clickPhrases[Math.floor(Math.random() * clickPhrases.length)];
    setBubbleText(randomPhrase);

    // Startled jump: animate Y up and back down
    let jumpStartTime: number;
    const animateJump = (timestamp: number) => {
      if (!jumpStartTime) jumpStartTime = timestamp;
      const elapsed = timestamp - jumpStartTime;
      const duration = 400; // Total jump duration

      const progress = elapsed / duration;
      if (progress < 1) {
        // Sine wave for smooth jump curve
        const jumpHeight = 0.35; // em units high
        const currentHeight = Math.sin(progress * Math.PI) * jumpHeight;
        setPosY(originalY - currentHeight);

        // Squash and stretch during jump
        if (progress < 0.25) setScaleY(0.75);
        else if (progress < 0.75) setScaleY(1.2);
        else setScaleY(0.85);

        requestAnimationFrame(animateJump);
      } else {
        setPosY(originalY);
        setScaleY(1);
        setIsJumping(false);
        // Clear speech bubble after 1.5s
        setTimeout(() => {
          setBubbleText(null);
        }, 1500);
      }
    };

    requestAnimationFrame(animateJump);
  };

  // Blinking loop for sitting state
  useEffect(() => {
    if (catState !== CatState.SITTING) return;

    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 150);
    }, 3800); // Blink every ~3.8 seconds

    return () => clearInterval(interval);
  }, [catState]);

  // Render correct SVG frame based on catState
  const renderCatSVG = () => {
    const filterShadow = "drop-shadow-[0_2px_2.5px_rgba(0,0,0,0.65)] dark:drop-shadow-[0_2px_4.5px_rgba(255,255,255,0.5)]";
    if (catState === CatState.SITTING) {
      // Sitting frame
      return (
        <svg viewBox="0 0 24 24" className={`w-full h-full text-black dark:text-white transition-colors duration-500 ${filterShadow}`} fill="currentColor">
          {/* Main upright sitting body */}
          <path d="M7 17 C 7 12, 9.5 9, 12 9 C 14.5 9, 17 12, 17 17 C 17 19.5, 15.5 20.5, 12 20.5 C 8.5 20.5, 7 19.5, 7 17 Z" />

          {/* Head */}
          <circle cx="12" cy="6.5" r="3.5" />

          {/* Ears */}
          <polygon points="9.2,4.5 11,0.5 12,4" />
          <polygon points="12,4 13,0.5 14.8,4.5" />

          {/* Tail that flicks back and forth */}
          <path
            className="origin-bottom animate-tail-wag"
            d="M16 18 C 18 18, 19.5 16, 19.5 13 C 19.5 11.5, 20.5 11.5, 20.5 13 C 20.5 17, 18.5 19.5, 15.5 19.5 C 14.5 19.5, 14.5 18, 15.5 18 Z"
          />

          {/* Dynamic Blinking Eyes - using cutout styled from global background */}
          {!isBlinking && (
            <>
              {/* Left eye */}
              <circle cx="10.8" cy="6.2" r="0.6" fill="var(--bg-primary)" style={{ transition: 'fill 0.5s' }} />
              {/* Right eye */}
              <circle cx="13.2" cy="6.2" r="0.6" fill="var(--bg-primary)" style={{ transition: 'fill 0.5s' }} />
            </>
          )}

          {/* Symmetrical front paws */}
          <circle cx="10" cy="20" r="1.1" />
          <circle cx="14" cy="20" r="1.1" />
        </svg>
      );
    }

    if (catState === CatState.ANTICIPATING) {
      // Shaking/wobbling frame
      return (
        <svg viewBox="0 0 24 24" className={`w-full h-full text-black dark:text-white animate-bounce ${filterShadow}`} fill="currentColor">
          <rect x="7" y="10" width="10" height="5.5" rx="2" />
          <circle cx="17.5" cy="9" r="3.5" />
          <polygon points="15.5,6.5 17,2.5 18,6" />
          <polygon points="18.5,6 19.5,2.5 20.8,6" />
          {/* Spooked upright tail */}
          <path d="M7 10 C 6 6, 6 3, 8.5 1 C 9.5 0, 10 1, 9 3 C 8 5, 8 8, 9.5 10 Z" />
          {/* Straight legs */}
          <line x1="8.5" y1="15.5" x2="8.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="10.5" y1="15.5" x2="10.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="13.5" y1="15.5" x2="13.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="15.5" y1="15.5" x2="15.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    }

    if (catState === CatState.FALLING) {
      // Falling/Flailing frame
      return (
        <svg viewBox="0 0 24 24" className={`w-full h-full text-black dark:text-white ${filterShadow}`} fill="currentColor">
          <rect x="7.5" y="9.5" width="9" height="5.5" rx="2.2" transform="rotate(-15 12 12)" />
          <circle cx="16.5" cy="7.5" r="3.5" />
          <polygon points="14.5,5 16,1 17,4.5" />
          <polygon points="17.5,4.5 18.5,1 19.8,4.5" />
          {/* Flailing tail */}
          <path d="M8 10 C 7 5, 6 3, 8.5 1.5 C 9.5 1, 10 2, 9 4 C 7.5 6.5, 8.5 8.5, 9.5 10 Z" />
          {/* Split legs flying outward */}
          <line x1="8" y1="14.5" x2="5" y2="18.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="10.5" y1="14.5" x2="8.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="13.5" y1="14.5" x2="15.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="15.5" y1="14.5" x2="18.5" y2="17.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    }

    if (catState === CatState.JUMPING_UP || catState === CatState.JUMPING_DOWN) {
      // Reaching forward leap/climb frame
      return (
        <svg viewBox="0 0 24 24" className={`w-full h-full text-black dark:text-white transition-colors duration-500 ${filterShadow}`} fill="currentColor">
          {/* Main elongated body stretched in jump */}
          <rect x="6" y="9.5" width="12" height="4.8" rx="2.4" />

          {/* Head looking slightly upward */}
          <circle cx="18" cy="8" r="3.2" />

          {/* Ears pinned back for aerodynamic speed */}
          <polygon points="15.5,5.5 17,2.5 18,5.5" />
          <polygon points="17.5,5.5 19,3 19.8,5.5" />

          {/* Long tail trailing straight behind */}
          <path d="M6 11.5 C 4 10, 2 11.5, 0.5 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />

          {/* Front legs reaching forward/upward */}
          <line x1="16.5" y1="12.5" x2="20.5" y2="14.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="17.2" y1="11.5" x2="21.5" y2="12.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />

          {/* Back legs extending backward */}
          <line x1="8" y1="13.5" x2="4" y2="16.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="7" y1="12.5" x2="3.2" y2="13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    }

    // Walking frame A or B
    return (
      <svg viewBox="0 0 24 24" className={`w-full h-full text-black dark:text-white transition-colors duration-500 ${filterShadow}`} fill="currentColor">
        {/* Tail */}
        <path d="M6 14 C 4 10, 3 6, 5 4 C 6 3, 7 4, 6 6 C 5 8, 6 11, 8 13 Z" />
        {/* Body */}
        <rect x="7" y="10" width="10" height="5" rx="2" />
        {/* Head */}
        <circle cx="17" cy="9" r="3.5" />
        {/* Ears */}
        <polygon points="15,6 17,2 18,6" />
        <polygon points="18,6 19.5,2.5 20.5,6" />

        {/* Alternating Walk Legs */}
        {walkFrame === 0 ? (
          <>
            <line x1="8.5" y1="15" x2="6.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="10.5" y1="15" x2="11.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="13.5" y1="15" x2="12" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="15.5" y1="15" x2="17.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <line x1="8.5" y1="15" x2="10" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="10.5" y1="15" x2="8.5" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="13.5" y1="15" x2="15" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="15.5" y1="15" x2="14" y2="19.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div
      style={{
        left: `${posX}%`,
        top: `${posY}em`,
        transform: `rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY})`,
        width: '0.34em',
        height: '0.34em',
        zIndex: 50,
        willChange: 'transform, left, top',
      }}
      className={`absolute select-none cursor-pointer pointer-events-auto transition-transform duration-75 flex items-center justify-center ${catState === CatState.ANTICIPATING ? 'animate-shake' : ''
        }`}
      onClick={handleCatClick}
    >
      {/* Speech Bubble */}
      {bubbleText && (
        <div
          className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none animate-fade-in-bubble"
          style={{ transform: `scaleX(${scaleX})` }} // Counteract parent scaleX rotation mirror
        >
          <div className="bg-zinc-950 dark:bg-zinc-900 text-white dark:text-zinc-100 border border-zinc-800 dark:border-zinc-700 px-2 py-1 text-[9px] font-bold font-mono tracking-wider rounded-md whitespace-nowrap shadow-md">
            {bubbleText}
          </div>
          {/* Speech Bubble Arrow */}
          <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-zinc-950 dark:border-t-zinc-900 -mt-[1px]" />
        </div>
      )}

      {/* Cat SVG wrapper */}
      <div className="w-full h-full flex items-center justify-center">
        {renderCatSVG()}
      </div>

      {/* Dust burst particles on landing */}
      {dustParticles.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {dustParticles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-dust-burst"
              style={
                {
                  '--dx': `${particle.dx}px`,
                  '--dy': `${particle.dy}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Embedded CSS for custom keyframes and tail flick animation */}
      <style>{`
        @keyframes tail-wag-kf {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-22deg); }
        }
        .animate-tail-wag {
          animation: tail-wag-kf 1.6s ease-in-out infinite;
        }
        @keyframes shake-kf {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-1px, 0px) rotate(-1.5deg); }
          40% { transform: translate(1px, -0.5px) rotate(1.5deg); }
          60% { transform: translate(-1px, 0.5px) rotate(-1deg); }
          80% { transform: translate(1px, 0px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake-kf 0.35s infinite;
        }
        @keyframes fade-in-bubble-kf {
          0% { opacity: 0; transform: scale(0.85) translateY(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in-bubble {
          animation: fade-in-bubble-kf 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes dust-burst-kf {
          0% { transform: translate(0, 0) scale(1); opacity: 0.95; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.35); opacity: 0; }
        }
        .animate-dust-burst {
          animation: dust-burst-kf 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </div>
  );
};
