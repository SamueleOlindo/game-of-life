import React, { useCallback, useRef, useState } from 'react';
import produce from 'immer';
import './App.css';

//this version of the game has a finite grid so i'm initializing the number of rows and columns
const numRows = 20;
const numCols = 20;

const gameOperations = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function App() {
  // the useState hooks here is used to initialize the grid.
  const [grid, setGrid] = useState(() =>{
    const rows = [];
    for (let i = 0; i < numRows; i++){
      rows.push(Array.from(Array(numCols), () => 0))
    }
    return rows;
  });

  //using the callback hook because i don't want the function to be created at every render
  const run = useCallback(() =>{
     if(!isGoingRef.current){
       return;
     }

     setGrid(g => {
      //produce comes from the library immer, it helps us in creating the new grid 
      return produce(g, gridCopy => {
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            let neighbours = 0;
            //here we calculate how many neighbors a single cell can have
            gameOperations.forEach(([x, y]) => {
              const newI = i + x;
              const newJ = j + y;
              if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
                neighbours += g[newI][newJ];
              }
            });

            if (neighbours < 2 || neighbours > 3) {
              //as the rules say, if a cell has less than 2 or more than 3 neighbours it dies, so this is a kill condition
              gridCopy[i][j] = 0;
              //instead when we're having a dead cell, if it has exactly 3 neighbours it becomes alive
            } else if (g[i][j] === 0 && neighbours === 3) {
              gridCopy[i][j] = 1;
            }
          }
        }
      });
    });

     // the next generation is displayed after 800ms
     setTimeout(run , 800);
  }, [])

  const [isGoing, setIsGoing] = useState(false);

  /* here i need to use the useRef hook because since the "run" function is made with the useCallback hook it only gets
  created once, but i still need to get access to the isGoing state variable and this is one way to do it. */
  const isGoingRef = useRef(isGoing);
  isGoingRef.current = isGoing;
  
  return (
   <>
    <div className='flex flex-col items-center justify-center'>
    <h2 className='text-5xl uppercase font-bold pt-14'>Game of life</h2>
    <p className='text-[18px] uppercase font-semibold pt-2'>Set the initial state by clicking the cells</p>
    <button 
      className='px-4 py-2 bg-[#000] text-white font-semibold rounded-lg my-[20px]'
       onClick={() => {
         setIsGoing(!isGoing);
         if(!isGoing) {
          isGoingRef.current = true;
          run();
         }
         
         
         }}>
      {isGoing ? "Stop" : "Calculate next generation"}
    </button>
   
    <div
    //displaying the grid
     className='grid mt-18 '
     style={{gridTemplateColumns : `repeat(${numCols}, 20px)`}}
     >
       {grid.map((rows, r) => rows.map((col, c) =>
      <div
       //with the onClick method we can click the desidered cell to be alive or dead on the inital state
       onClick={() =>{
         //using the library immer we can create a new grid
         const newGrid = produce(grid, gridCopy => {
           //this line of code allows us to toggle the cell between alive and dead
           gridCopy[r][c] = 1-grid[r][c];
         })
         setGrid(newGrid);
       }}
       key = {`${r}-${c}`}
       className = "w-[20px] h-[20px] border border-[#000] bg-[#828282]" 
       style={{backgroundColor: grid[r][c] ? 'yellow' :  undefined}}/>
       ))}
    </div>
    </div>
    </>
  );
}

export default App;
