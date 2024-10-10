import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css'
import { randomMoleTime, debounce } from './utils/common-function';


function App() {
  const [moleIndex, setMoleIndex] = useState<number | null>(null);
  const [failedClicks, setFailedClicks] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeTake, setTimeTake] = useState<number>(0);
  const [numOfHoles, setNumOfHoles] = useState<number>(3);
  const [difficulty, setDifficulty] = useState('easy');

  const moleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const canHitRef = useRef<boolean>(true); // Ref to track if mole can be hit (for debouncing)


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDifficulty(event.target.value);
  };

  useEffect(() => {
    return () => {
      clearTimeout(moleTimeoutRef.current!); // Clear timeout on unmount
    };
  }, []);

  useEffect(() => {
    let interval: any = 0;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeTake((prevCount) => prevCount + 1);
      }, 1000);
    } else if (!isPlaying && timeTake !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeTake]);

  useEffect(() => {
    if (difficulty === 'medium') {
      setNumOfHoles(6)
    } else if (difficulty === 'hard') {
      setNumOfHoles(9)
    } else {
      setNumOfHoles(3)
    }
  }, [handleChange, difficulty])



  const startGame = useCallback(() => {
    setFailedClicks(0);
    setStartTime(Date.now());
    setIsPlaying(true);
    canHitRef.current = true;
    setMoleIndex(Math.floor(Math.random() * numOfHoles));
    scheduleMole();
    setTimeTake(0)
  }, [numOfHoles]);


  const scheduleMole = useCallback(() => {
    moleTimeoutRef.current = setTimeout(() => {
      setMoleIndex(Math.floor(Math.random() * numOfHoles));
      canHitRef.current = true;
      scheduleMole();
    }, randomMoleTime());
  }, [numOfHoles]);


  const hitMole = useCallback(() => {
    if (isPlaying && canHitRef.current) {

      const timeTaken = Math.floor((Date.now() - (startTime as number)) / 1000);

      setIsPlaying(false);
      clearTimeout(moleTimeoutRef.current!);
      alert(`Congratulations! You clicked the mole! It took you ${timeTaken} seconds and you missed ${failedClicks} times.`);
    }
  }, [isPlaying, startTime, failedClicks]);


  const failClick = useCallback(() => {
    if (isPlaying) {
      setFailedClicks((prev) => prev + 1);
    }
  }, [isPlaying]);





  // Memoize the game grid to avoid unnecessary re-renders
  const gameGrid = useMemo(() => (
    [...Array(numOfHoles)].map((_, index) => (
      <div
        key={index}
        className={`hole ${index === moleIndex ? 'mole' : ''}`}
        onClick={debounce(() => {
          if (index === moleIndex) {
            hitMole();
          } else {
            failClick();
          }
          canHitRef.current = false; // Prevent hitting again too fast
        }, 200)}
      />
    ))
  ), [moleIndex, hitMole, failClick, numOfHoles]);

  return (
    <div className="App">
      <h1>Catch the Mole Game</h1>

      <div>
        <h3>Choose Difficulties</h3>
        <div>
          <label>
            <input
              type="radio"
              value="easy"
              checked={difficulty === 'easy'}
              onChange={handleChange}
            />
            Easy
          </label>
          <label>
            <input
              type="radio"
              value="medium"
              checked={difficulty === 'medium'}
              onChange={handleChange}
            />
            Medium
          </label>
          <label>
            <input
              type="radio"
              value="hard"
              checked={difficulty === 'hard'}
              onChange={handleChange}
            />
            Hard
          </label>
        </div>
      </div>

      <div className="scoreboard">
        <p>Clicks: {failedClicks}</p>
        <p>Elapsed Time: {timeTake}</p>
      </div>

      <div className="game-grid">
        {gameGrid}
      </div>

      {!isPlaying && (
        <button className='main-btn' onClick={startGame}>Start Game</button>
      )}
    </div>
  );
}

export default App
