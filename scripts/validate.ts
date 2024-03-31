import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network, upgrades } from "hardhat";
import {
  BlocjerkTokenV5__factory,
  BlocjerkTokenV6__factory,
} from "../typechain";
import { getManifest } from "./helpers";

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

  const proxyAddr = manifest.proxies[0].address;

  console.log("Proxy Address", proxyAddr);

  const BlocjerkTokenV5Factory = new BlocjerkTokenV5__factory(deployer);
  const BlocjerkTokenV6Factory = new BlocjerkTokenV6__factory(deployer);

  // Validate the upgrade without deploying/upgrading it
  await upgrades.validateUpgrade(BlocjerkTokenV5Factory, BlocjerkTokenV6Factory);

  await upgrades.validateImplementation(BlocjerkTokenV6Factory);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
