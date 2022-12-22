import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SimpleStorage, SimpleStorage__factory } from '../typechain-types';

describe('SimpleStorage', function () {
  let SimpleStorageFactory: SimpleStorage__factory;
  let simpleStorage: SimpleStorage;

  beforeEach(async function () {
    const SimpleStorageFactory = await ethers.getContractFactory(
      'SimpleStorage'
    );

    simpleStorage = await SimpleStorageFactory.deploy();
  });

  it('should be equal to default 0', async function () {
    expect((await simpleStorage.retrieve()).toString()).to.be.equal('0');
  });

  it('should change the value of favouriteNumber', async function () {
    const txRes = await simpleStorage.store('6');
    await txRes.wait(1);

    expect((await simpleStorage.retrieve()).toString()).to.be.equal('6');
  });
});
