import React, { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { useProgram } from '../../context/ProgramContext';

const MegaMenu = () => {
  const { programName, setProgramName, setFunctionNames, setMintFunctions, setPrivateFunctions, setPublicFunctions, private_key, setPrivate_key } = useProgram();
  const [loaded, setLoaded] = useState(false);
  const [keyStat, setKeyStat] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState<string>('')


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setProgramName(event.target.value);
  };
  
  const handlePrivateKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrivateKeyInput(event.target.value)
  }

  const setKey = () => {
    setKeyStat(true);
    setPrivate_key(privateKeyInput)
  }

  const setFunctions = () => {
    setLoaded(true);
    fetch(`https://explorer.hamp.app/testnet3/program/${programName}`)
      .then(response => response.text())
      .then(data => {
        const functionNames = data.match(/function\s+\w+/g)?.map(fn => fn.split(' ')[1]) || [];
        const mintFunctions = functionNames.filter(name => name.includes('mint'));
        const privateFunctions = functionNames.filter(name => 
          !name.includes('mint') && 
          (name.includes('private') && (!name.includes('public') || name.indexOf('private') < name.indexOf('public')))
        );
        const publicFunctions = functionNames.filter(name => 
          !name.includes('mint') && 
          (name.includes('public') && (!name.includes('private') || name.indexOf('public') < name.indexOf('private')))
        );
        setFunctionNames(functionNames)
        setMintFunctions(mintFunctions);
        setPrivateFunctions(privateFunctions);
        setPublicFunctions(publicFunctions);
        console.log(mintFunctions,publicFunctions,privateFunctions)
      })
      .catch(error => console.error('Error:', error))
      .finally(() => setLoaded(false));
  };

  return (
    <nav className="relative bg-white border-b-2 border-gray-300 text-gray-900">
      <div className="container mx-auto flex justify-between">
        <div className="relative block p-4 lg:p-6 text-xl text-blue-600 font-bold">Token Workshop</div>
        <div className="flex items-center gap-1">
          <input
            type="text"
            placeholder="Program Id (.aleo)"
            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={programName}
            onChange={handleInputChange}
          />
          {/* Inputs to set the program functions */}
         <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 whitespace-nowrap" onClick={setFunctions}>
            {loaded ? 'Loading...' : 'Set Program'}
          </button>
          {/* Inputs to set the private key */}
          <input
            type="text"
            placeholder="APrivate"
            className="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={privateKeyInput}
            onChange={handlePrivateKeyChange}
          />
         <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 whitespace-nowrap" onClick={setKey}>
            {keyStat ? 'Setted' : 'Provide Key'}
          </button>
        </div>
        <ul className="flex">
          <li className="hover:bg-blue-800 hover:text-white">
            <Link href="/" className="relative block py-6 px-2 lg:p-6 text-sm lg:text-base font-bold nav-link">Mint</Link>
          </li>
          <li className="toggleable hover:bg-blue-800 hover:text-white">
            <Link href="/private" className="block cursor-pointer py-6 px-4 lg:p-6 text-sm lg:text-base font-bold nav-link">Private</Link>
          </li>
          <li className="hoverable hover:bg-blue-800 hover:text-white">
            <Link href="/public" className="relative block py-6 px-4 lg:p-6 text-sm lg:text-base font-bold hover:bg-blue-800 hover:text-white nav-link">Public</Link>
          </li>
          <div className='mt-3 ml-2'>

          </div>
        </ul>
      </div>
    </nav>
  );
};

export default MegaMenu;
