import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network, upgrades } from "hardhat";
import {
  BlocjerkTokenV4__factory,
  BlocjerkTokenV5__factory,
} from "../typechain";
import { config } from "./config";
import { getManifest, verifyContract } from "./helpers";

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

  const BlocjerkTokenV4Factory = new BlocjerkTokenV4__factory(deployer);
  const BlocjerkTokenV5Factory = new BlocjerkTokenV5__factory(deployer);

  // Validate the upgrade without deploying/upgrading it
  await upgrades.validateUpgrade(BlocjerkTokenV4Factory, BlocjerkTokenV5Factory);

  await upgrades.validateImplementation(BlocjerkTokenV5Factory);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
