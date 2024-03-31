import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BlocjerkTokenV4UpgradeSafeWithCore__factory, TestParent__factory, BlocjerkTokenV5__factory, BlocjerkTokenV5, BlocjerkTokenV6__factory } from "../typechain";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

describe("UpgradeabilityV6", () => {
  let deployer: SignerWithAddress,
    pool: SignerWithAddress,
    taxTo: SignerWithAddress,
    user1: SignerWithAddress,
    user2: SignerWithAddress;

  let blocjerkToken: BlocjerkTokenV5;

  beforeEach("initial setup", async () => {
    [deployer, pool, taxTo, user1, user2] = await ethers.getSigners();

    const blocjerkTokenFactory = new BlocjerkTokenV5__factory(deployer);
    blocjerkToken = (await upgrades.deployProxy(blocjerkTokenFactory, [
      "Blocjerk",
      "DHB",
    ])) as BlocjerkTokenV5;
    await blocjerkToken.deployed();

    await blocjerkToken.setTaxTo(taxTo.address);

    await blocjerkToken.mint(pool.address, ethers.utils.parseEther("30000"));
    await blocjerkToken.mint(user1.address, ethers.utils.parseEther("20000"));
    await blocjerkToken.mint(user2.address, ethers.utils.parseEther("10000"));

    // set some storage
    await blocjerkToken.setBuySellTaxRate(100, 200);
    await blocjerkToken.authorizeSnapshotter(user1.address);
    await blocjerkToken.authorizeSnapshotter(user2.address);
    await blocjerkToken.addPoolToTax(user1.address);
    await blocjerkToken.addPoolToTax(user2.address);
  });

  it("upgrade safe test with v6", async () => {
    // Backup storage values before upgrade
    const poolBalance = await blocjerkToken.balanceOf(pool.address);
    const user1Balance = await blocjerkToken.balanceOf(user1.address);
    const user2Balance = await blocjerkToken.balanceOf(user2.address);

    const buySellTaxRate = await blocjerkToken.buyTaxRate();
    const poolUser1 = await blocjerkToken.poolsToTax(user1.address);
    const poolUser2 = await blocjerkToken.poolsToTax(user2.address);

    try {
      const BlocjerkTokenV5Factory = new BlocjerkTokenV6__factory(deployer);
      await upgrades.upgradeProxy(blocjerkToken, BlocjerkTokenV5Factory);
    } catch (err) {
      console.error(err);
      expect(false).to.be.true;
      return;
    }

    // Get storage values again after upgrade
    const poolBalanceAfter = await blocjerkToken.balanceOf(pool.address);
    const user1BalanceAfter = await blocjerkToken.balanceOf(user1.address);
    const user2BalanceAfter = await blocjerkToken.balanceOf(user2.address);

    const buySellTaxRateAfter = await blocjerkToken.buyTaxRate();
    const poolUser1After = await blocjerkToken.poolsToTax(user1.address);
    const poolUser2After = await blocjerkToken.poolsToTax(user2.address);

    expect(poolBalance).eq(poolBalanceAfter);
    expect(user1Balance).eq(user1BalanceAfter);
    expect(user2Balance).eq(user2BalanceAfter);
    expect(buySellTaxRate).eq(buySellTaxRateAfter);
    expect(poolUser1).eq(poolUser1After);
    expect(poolUser2).eq(poolUser2After);
  });
});
