import React, { useState, useEffect, useCallback, useRef } from "react";
import FunctionComponent from "@/components/FunctionCards/FunctionCard";
import { Inter } from "next/font/google";
import { useProgram } from "@/context/ProgramContext";


const inter = Inter({ subsets: ["latin"] });
interface InputData {
  [key: string]: string;
}

interface Inputs {
  programId: string;
  functionName: string;
  amount: string;
  address: string;
  fee: number;
  privateKey: string;
}

interface WorkerExecuteMessage {
  type: "execute" | "key";
  programName?: string;
  functionName?: string;
  inputs?: any[]; 
  fee?: number;
}


export default function Home() {
  const { programName, private_key } = useProgram()
  const [error, setError] = useState<string | undefined>();
  const [executing, setExecuting] = useState(false);
  const [eventId, setEventId] = useState<string | undefined>();
  const [inputData, setInputData] = useState<InputData>({});
  const [publicInputs, setInputs] = useState<Inputs>({
    programId: '',
    functionName: '',
    amount: '',
    address: '',
    fee: 0,
    privateKey: '',
  });
  const [account, setAccount] = useState(null);
  

  const handleInputDataChange = (newInputData:any) => {
    setInputData(newInputData);
  };

const generateAccount = async () => {
    workerRef.current?.postMessage("key");
};

const setPrivateKey = async () => {
  workerRef.current?.postMessage("set")
}

const workerRef = useRef<Worker>();

interface AleoWorkerMessageEvent {
    type: string;
    result: any;
    account: any;
    errorMessage: any;
    inputs: any;
}


useEffect(() => {
  workerRef.current = new Worker(new URL("worker.ts", import.meta.url));
  workerRef.current.onmessage = (event: MessageEvent<AleoWorkerMessageEvent>) => {
    switch (event.data.type) {
      case "key":
        setAccount(event.data.result);
        console.log("Account key received:", event.data.result);
        break;
      case "execute":
        setExecuting(false);
        console.log("Execution completed:", event.data.result);
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
        console.log("Execution transaction completed:", event.data.result);
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


  const handleWork = useCallback(async () => {
      workerRef.current?.postMessage("execute");
  }, []);

  const handleSubmission = useCallback(async () => {
    if (!private_key) return

    const newInputs = {
      programId: programName,
      functionName: inputData['1-StringBox-0'],
      amount: inputData['1-AmountBox-1'],
      address: inputData['1-AddressBox-2'],
      fee: Number(inputData['1-FeeBox-3']),
      privateKey: private_key
    };
  
    setInputs(newInputs);

    const values = [newInputs.address, newInputs.amount]

    setExecuting(true);

    workerRef.current?.postMessage({
      type: "execute",
      programName: newInputs.programId,
      functionName: newInputs.functionName,
      inputs: values, 
      fee: newInputs.fee,
      privateKey: private_key
  });
    setExecuting(false);

    console.log(newInputs);
  }, [private_key, inputData]);;

  return (
    <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
      <div className="flex flex-col items-center">
      <FunctionComponent 
        titles={["Mint"]} 
        inputTypes={[["StringBox", "AmountBox", "AddressBox", "FeeBox"]]}
        onInputChange={handleInputDataChange}
        onSubmission={handleSubmission}
        isWalletConnected={true}
      />
        {eventId && (
          <div>
            <div>      
              { eventId && <p>event pending: {eventId}</p> }
              { error && <p>error creating event: {error}</p> }</div>
          </div>
        )}
      </div>
    </main>
  );
}
