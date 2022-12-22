import { ethers } from 'ethers';
import * as fs from 'fs-extra';

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_PROVIDER
  );
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  const abi = await fs.readFile(
    './SimpleStorage_sol_SimpleStorage.abi',
    'utf8'
  );
  const binary = await fs.readFile(
    './SimpleStorage_sol_SimpleStorage.bin',
    'utf8'
  );

  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

  const contract = await contractFactory.deploy();
  await contract.deployTransaction.wait(1);

  const txRes = await contract.store('7');
  const txRec = await txRes.wait(1);
  const fValue = await contract.retrieve();

  console.log(fValue.toString());

  console.log('Successfully deployed!');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Error :( \n', err.message);
    process.exit(1);
  });
