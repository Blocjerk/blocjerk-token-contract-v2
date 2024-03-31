import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, network, upgrades } from "hardhat";
import {
  BlocjerkTokenV4,
  BlocjerkTokenV4__factory,
} from "../typechain";
import { config } from "./config";
import { verifyContract } from "./helpers";

const main = async () => {
  const signers = await ethers.getSigners();
  if (signers.length < 1) {
    throw new Error(`Not found deployer`);
  }

  const deployer: SignerWithAddress = signers[0];
  console.log(`Using deployer address ${deployer.address}`);

  if (
    network.name === "mainnet" ||
    // network.name === "goerli" ||
    network.name === "sepolia" ||
    network.name === "arbitrumOne" ||
    network.name === "arbitrumGoerli" ||
    // network.name === "polygon" ||
    // network.name === "polygonMumbai" ||
    // network.name === "bsc" ||
    // network.name === "bscTestnet" ||
    network.name === "tenderly" ||
    false
  ) {
    console.log(config[network.name]);

    const BlocjerkTokenFactory = new BlocjerkTokenV4__factory(deployer);
    const bjToken = (await upgrades.deployProxy(BlocjerkTokenFactory, [
      config[network.name].name,
      config[network.name].symbol,
    ])) as BlocjerkTokenV4;
    await bjToken.deployed();

    console.log(`BlocjerkToken deployed at ${bjToken.address}`);

    const bjTokenImpl = await upgrades.erc1967.getImplementationAddress(
      bjToken.address
    );
    // await verifyContract(bjTokenImpl);

    // console.log(`Minting tokens...`);
    // const tx = await bjToken.mint(
    //   config[network.name].treasuryAddress,
    //   config[network.name].totalSupply
    // );
    // console.log(`Waiting to finish...`);
    // await tx.wait();
    // console.log(`Finished minting`);

    // console.log(
    //   `Transferring token ownership to ${config[network.name].ownerAddress}`
    // );
    // await bjToken.transferOwnership(config[network.name].ownerAddress);

    // console.log(
    //   `Transferring proxy admin ownership to ${
    //     config[network.name].ownerAddress
    //   }`
    // );
    // await upgrades.admin.transferProxyAdminOwnership(
    //   config[network.name].ownerAddress
    // );

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
        Info: bjTokenImpl,
      },
      {
        Label: "Owner address",
        Info: config[network.name].ownerAddress,
      },
      {
        Label: "Treasury address",
        Info: config[network.name].treasuryAddress,
      },
      {
        Label: "Total supply",
        Info: ethers.utils
          .formatEther(config[network.name].totalSupply)
          .toString(),
      },
    ]);
  }
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
