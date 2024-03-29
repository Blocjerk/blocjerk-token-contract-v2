import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network, upgrades } from "hardhat";
import {
  BlocjerkTokenV5,
  BlocjerkTokenV4__factory,
  BlocjerkTokenV5__factory,
} from "../typechain";
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

  // const BlocjerkTokenV4Factory = new BlocjerkTokenV4__factory(deployer);
  // await upgrades.forceImport(proxyAddr, BlocjerkTokenV4Factory);
  const BlocjerkTokenV5Factory = new BlocjerkTokenV5__factory(deployer);
  const bjToken = (await upgrades.upgradeProxy(
    proxyAddr,
    BlocjerkTokenV5Factory)) as BlocjerkTokenV5;

  console.log(`BlocjerkToken upgraded at ${bjToken.address}`);

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
