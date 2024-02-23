import {
    Account,
    initThreadPool,
    PrivateKey,
    ProgramManager,
    NetworkRecordProvider,
    KeySearchParams,
    AleoKeyProvider,
    AleoNetworkClient,
    AleoKeyProviderParams
  } from "@aleohq/sdk";
  
  await initThreadPool();
  

  self.postMessage({
    type: "ALEO_WORKER_READY",
  });

  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);
  const networkClient = new AleoNetworkClient("https://api.explorer.aleo.org/v1");
  
  async function ProgramExecution(programId: string, aleoFunction: string, inputs: string[], fee: number, private_key: string) {
    try {

      const account = new Account({ privateKey: private_key });
      const privateKeyObject = PrivateKey.from_string(private_key);
      const recordProvider = new NetworkRecordProvider(account, networkClient);
      const programManager = new ProgramManager("https://api.explorer.aleo.org/v1", keyProvider, recordProvider);
      programManager.setHost("https://api.explorer.aleo.org/v1")
      programManager.setAccount(account);
  
      const program = await programManager.networkClient.getProgramObject(programId);
  
      // Check for existing keys or synthesize new ones as necessary
      const cacheKey = `${programId}:${aleoFunction}`;
      const keyParams = new AleoKeyProviderParams({ "cacheKey": cacheKey });
  
      // Execute the program function
      const executionResponse = await programManager.execute(
        programId,
        aleoFunction,
        fee,
        false,
        inputs,
        undefined,
        keyParams,
        undefined,
        undefined,
        undefined,
        privateKeyObject
      );
  
      // Post the execution response back to the main thread
      self.postMessage({
        type: "EXECUTION_TRANSACTION_COMPLETED",
        executeTransaction: executionResponse,
      });
    } catch (error) {
      // Log and post any errors encountered during execution
      console.error(`Error creating execution transaction: ${error}`);
      self.postMessage({
        type: "ERROR",
        errorMessage: error?.toString(),
      });
    }
  }
  
  
  function getPrivateKey() {
    return new PrivateKey().to_string();
  }
  
  onmessage = async function (e: MessageEvent<any>) {
    if (e.data.type === "execute") {
      const { programName, functionName, inputs, fee, privateKey } = e.data;
      this.postMessage({type:"inputs", inputs: {programName,functionName,inputs,fee,privateKey}}) 
      const result = await ProgramExecution(programName, functionName, inputs, fee, privateKey);
      postMessage({type: "execute", result: result});
    } else if (e.data.type === "key") {
      const result = getPrivateKey();
      postMessage({type: "key", result: result});
    }
  };
  