const minMoleTime: number = 200; 

const maxMoleTime: number = 400; 

export const randomMoleTime = (): number =>
    Math.floor(Math.random() * (maxMoleTime - minMoleTime + 1)) + minMoleTime;
  
  // Reusable debounce function
export const debounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeout: NodeJS.Timeout;
    return ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  };