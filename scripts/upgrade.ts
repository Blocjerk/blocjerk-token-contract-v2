import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network, upgrades } from "hardhat";
import {
  BlocjerkTokenV6,
  BlocjerkTokenV5__factory,
  BlocjerkTokenV6__factory,
} from "../typechain";
import { getManifest, sleep, verifyContract } from "./helpers";

const main = async () => {
  const signers = await ethers.getSigners();
  if (signers.length < 1) {
    throw new Error(`Not found deployer`);
  }

  const deployer: SignerWithAddress = signers[0];
  console.log(`Using deployer address ${deployer.address}`);

  const manifest = getManifest(network.name);
  if (!manifest) {
    throw new Error(`Not found manifest for ${network.name}`);
  }

  if (network.name === "tenderlySepolia" || network.name === "tenderlyMainnet") {
    await network.provider.send("tenderly_setBalance", [
      deployer.address,
      ethers.utils.parseEther("1000").toHexString(),
    ]);
    const balance = await deployer.getBalance();
    console.log("Balance", balance.toString());
  }

  const proxyAddr = manifest.proxies[0].address;

  console.log("Proxy Address", proxyAddr);

  // const BlocjerkTokenV5Factory = new BlocjerkTokenV5__factory(deployer);
  // await upgrades.forceImport(proxyAddr, BlocjerkTokenV5Factory);
  const BlocjerkTokenV6Factory = new BlocjerkTokenV6__factory(deployer);
  const bjToken = (await upgrades.upgradeProxy(
    proxyAddr,
    BlocjerkTokenV6Factory)) as BlocjerkTokenV6;

  console.log(`BlocjerkToken upgraded at ${bjToken.address}`);

  console.log("Sleeping for 10 seconds for deployment...");
  await sleep(10000);

  const blocjerkTokenImpl = await upgrades.erc1967.getImplementationAddress(
    bjToken.address
  );
  console.log(`BlocjerkToken implementation at ${blocjerkTokenImpl}`);
  await verifyContract(blocjerkTokenImpl);

  console.table([
    {
      Label: "Deployer",
      Info: deployer.address,
    },
    {
      Label: "BlocjerkToken",
      Info: bjToken.address,
    },
    {
      Label: "BlocjerkToken impl",
      Info: blocjerkTokenImpl,
    },
  ]);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
