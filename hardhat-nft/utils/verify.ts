import { run } from 'hardhat';

export async function verify(address: string, args: any[]) {
  try {
    await run('verify:verify', {
      address,
      constructorArguments: args,
    });
  } catch (err) {
    if (
      err instanceof Error &&
      err.message.toLowerCase().includes('already verified')
    ) {
      console.log(`Contracts are already verified: ${err.message}`);
    } else {
      console.error(err);
    }
  }
}
