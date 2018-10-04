const BN = require('bn.js');

const HumanStandardToken = artifacts.require('token-sale-contracts/contracts/HumanStandardToken.sol');
const VerifierRegistry = artifacts.require('VerifierRegistry');
const Token = artifacts.require('token-sale-contracts/contracts/Token.sol');

contract('VerifierRegistry', (accounts) => {
  describe('#create()', () => {
    let verifierRegistryContract;
    let eventLog;

    beforeEach(async () => {
      verifierRegistryContract = await VerifierRegistry.new('0x123', 3);

      await verifierRegistryContract.create('127.0.0.1')
        .then((response) => {
          [eventLog] = response.logs;
        });
    });

    it('should register a new verifier', async () => {
      assert.equal(await verifierRegistryContract.getNumberOfVerifiers.call(), 1);
    });

    it('should assign the expected shard number', async () => {
      const address = await verifierRegistryContract.addresses.call(0);

      const verifier = await verifierRegistryContract.verifiers.call(address);

      const shard = verifier[4].toNumber();

      assert.equal(shard, 0);
    });

    it('should require verifier to not be already created', async () => {
      await verifierRegistryContract.create('127.0.0.1')
        .catch((error) => {
          assert.isDefined(error);
        });
    });

    it('should emit event when verifier has registered', () => {
      assert.equal(eventLog.event, 'LogVerifierRegistered');
    });

    describe('after creating a verifier', () => {
      it('should emit create event with verifier id', () => {
        assert.equal(eventLog.args.id, accounts[0]);
      });

      it('should emit create event with verifier location', () => {
        assert.equal(eventLog.args.location, '127.0.0.1');
      });

      it('should emit create event with verifier created', () => {
        assert.equal(eventLog.args.created, true);
      });

      it('should emit create event with verifier balance', () => {
        assert.equal(eventLog.args.balance.toNumber(), 0);
      });

      it('should emit create event with verifier shard', () => {
        assert.equal(eventLog.args.shard.toNumber(), 0);
      });
    });
  });

  describe('#getNumberOfVerifiers()', () => {
    let verifierRegistryContract;

    beforeEach(async () => {
      verifierRegistryContract = await VerifierRegistry.new('0x123', 3);

      await verifierRegistryContract.create('127.0.0.1');
    });

    it('should return number of verifiers', async () => {
      assert.equal(await verifierRegistryContract.getNumberOfVerifiers.call(), 1);
    });
  });

  describe('#receiveApproval()', () => {
    describe('when transfer of tokens is successful', () => {
      let verifierRegistryContract;
      let cost;
      let humanStandardToken;

      beforeEach(async () => {
        cost = new BN('1000', 10);

        verifierRegistryContract = await VerifierRegistry.new('0x123', 3);

        humanStandardToken = await HumanStandardToken.deployed();

        await verifierRegistryContract.updateTokenAddress(humanStandardToken.address, {
          from: accounts[0],
        });

        await humanStandardToken.approve(verifierRegistryContract.address, cost.toNumber(), {
          from: accounts[0],
        });

        await verifierRegistryContract.create('127.0.0.1');

        await verifierRegistryContract.receiveApproval(accounts[0], 0, '0x123', '');
      });

      it('should deposit tokens to stake', async () => {
        const verifier = await verifierRegistryContract.verifiers.call(accounts[0]);

        assert.equal(verifier[3], cost.toNumber());
      });
    });
  });

  describe('#update()', () => {
    let verifierRegistryContract;

    beforeEach(async () => {
      verifierRegistryContract = await VerifierRegistry.new('0x123', 3);
    });

    it('should update verifier location', async () => {
      await verifierRegistryContract.create('127.0.0.1');

      await verifierRegistryContract.update('1.1.1.1');

      const verifier = await verifierRegistryContract.verifiers(accounts[0]);

      assert.equal(verifier[1], '1.1.1.1');
    });

    it('should require verifier to be created already', async () => {
      await verifierRegistryContract.update('1.2.3.4')
        .catch((error) => {
          assert.isDefined(error);
        });
    });

    it('should emit event when verifier has been updated', async () => {
      let eventLog;

      await verifierRegistryContract.create('127.0.0.1');

      await verifierRegistryContract.update('1.1.1.1')
        .then((response) => {
          [eventLog] = response.logs;
        });

      assert.equal(eventLog.event, 'LogVerifierUpdated');
    });

    describe('after updating a verifier', () => {
      let eventLog;

      beforeEach(async () => {
        await verifierRegistryContract.create('127.0.0.1');

        await verifierRegistryContract.update('1.1.1.1')
          .then((response) => {
            [eventLog] = response.logs;
          });
      });

      it('should emit update event with verifier id', () => {
        assert.equal(eventLog.args.id, accounts[0]);
      });

      it('should emit update event with verifier location', () => {
        assert.equal(eventLog.args.location, '1.1.1.1');
      });

      it('should emit update event with verifier created', () => {
        assert.equal(eventLog.args.created, true);
      });

      it('should emit update event with verifier balance', () => {
        assert.equal(eventLog.args.balance.toNumber(), 0);
      });

      it('should emit update event with verifier shard', () => {
        assert.equal(eventLog.args.shard.toNumber(), 0);
      });
    });
  });

  describe('#withdraw()', () => {
    describe('when withdraw of tokens is successful', () => {
      let cost;
      let humanStandardToken;
      let verifierRegistryContract;
      let withdraw;

      beforeEach(async () => {
        cost = new BN('1000', 10);
        withdraw = new BN('50', 10);

        verifierRegistryContract = await VerifierRegistry.new('0x123', 3);

        humanStandardToken = await HumanStandardToken.deployed();

        await verifierRegistryContract.updateTokenAddress(humanStandardToken.address, {
          from: accounts[0],
        });

        await humanStandardToken.approve(
          verifierRegistryContract.address,
          cost.toNumber(),
          { from: accounts[0] },
        );

        await verifierRegistryContract.create('127.0.0.1');

        await verifierRegistryContract.receiveApproval(accounts[0], 0, '0x123', '');

        await verifierRegistryContract.withdraw(
          withdraw.toNumber(),
          { from: accounts[0] },
        );
      });

      it('should withdraw tokens from stake', async () => {
        const balance = new BN('950', 10);
        const verifier = await verifierRegistryContract.verifiers.call(accounts[0]);

        assert.equal(verifier[3], balance.toNumber());
      });
    });
  });

  describe('#updateTokenAddress()', () => {
    let verifierRegistryContract;

    beforeEach(async () => {
      verifierRegistryContract = await VerifierRegistry.new('0x123', 3);

      await verifierRegistryContract.create('127.0.0.1');
    });

    it('should change token address', async () => {
      await verifierRegistryContract.updateTokenAddress(0x123);

      const tokenAddress = await verifierRegistryContract.tokenAddress();

      assert.equal(tokenAddress, 0x123);
    });
  });

  describe('#updateVerifiersPerShard()', () => {
    let verifierRegistryContract;

    beforeEach(async () => {
      verifierRegistryContract = await VerifierRegistry.new('0x123', 3);
    });

    it('should change number of verifiers per shard', async () => {
      await verifierRegistryContract.updateVerifiersPerShard(5);

      const verifiersPerShard = await verifierRegistryContract.verifiersPerShard();

      assert.equal(verifiersPerShard, 0x5);
    });
  });
});
