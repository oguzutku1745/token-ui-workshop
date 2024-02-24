import React, { useState, useEffect, useCallback, useRef } from "react";
import FunctionComponent from "@/components/FunctionCards/FunctionCard";
import { Inter } from "next/font/google";
import { useProgram } from "@/context/ProgramContext";
import { useWorker } from "@/hooks/useWorker";


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
}


export default function Public() {
    const {postMessage} = useWorker();
    const { programName, private_key } = useProgram();
    const [inputData, setInputData] = useState<InputData>({});
    const [executing, setExecuting] = useState(false);
    const [publicTransferInputs, setInputs] = useState<Inputs>({
      programId: '',
      functionName: '',
      amount: '',
      address: '',
      fee: 0,
    });

    const handleInputDataChange = (newInputData:any) => {
        setInputData(newInputData);
      };

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
    
        postMessage({
          type: "execute",
          programName: newInputs.programId,
          functionName: newInputs.functionName,
          inputs: values, 
          fee: newInputs.fee,
          privateKey: private_key
      });
        setExecuting(false);
    
        console.log(newInputs);
      }, [private_key, inputData]);

    return(
        <div className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
            <div className="flex flex-col items-center">
                <FunctionComponent 
                  titles={["Transfer From Public"]} 
                  inputTypes={[["StringBox", "AmountBox", "AddressBox", "FeeBox"]]}
                  onInputChange={handleInputDataChange}
                  onSubmission={handleSubmission}
                  isPrivateKeyGiven={!!private_key} 
                />
                </div>
        </div>
    )
}
