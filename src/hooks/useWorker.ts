// hooks/useWorker.ts
import { useEffect, useRef, useState } from 'react';

interface AleoWorkerMessageEvent {
  type: string;
  result: any;
  account: any;
  errorMessage: any;
  inputs: any;
  executeTransaction: any;
}

export const useWorker = () => {
  const workerRef = useRef<Worker | null>(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    workerRef.current = new Worker(new URL("../pages/worker.ts", import.meta.url));
    workerRef.current.onmessage = (event: MessageEvent<AleoWorkerMessageEvent>) => {
      switch (event.data.type) {
        case "key":
          setAccount(event.data.result);
          console.log("Account key received:", event.data.result);
          break;
        case "debug":
          console.log("Debug from worker:", event.data.account);
          break;
        case "inputs":
          console.log("Inputs for worker are:", event.data.inputs);
          break;
        case "ALEO_WORKER_READY":
          console.log("Aleo Worker is ready!");
          break;
        case "EXECUTION_TRANSACTION_COMPLETED":
          console.log("Execution transaction completed:", event.data.executeTransaction);
          break;
        case "ERROR":
          console.error("Error from worker:", event.data.errorMessage);
          setError(event.data.errorMessage);
          break;
        default:
          console.log("Unhandled message from worker:", event.data);
      }
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Expose worker functionalities that components might need
  const postMessage = (message: any) => {
    workerRef.current?.postMessage(message);
  };

  return { postMessage, account, error };
};
