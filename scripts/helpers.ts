import { run } from "hardhat";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { ethers } from "ethers";

import * as manifestMainnet from "../.openzeppelin/mainnet.json";
import * as manifestSepolia from "../.openzeppelin/unknown-11155111.json";
import * as manifestArbitrumOne from "../.openzeppelin/unknown-42161.json";

export const sleep = (m: number) => new Promise((r) => setTimeout(r, m));

export const verifyContract = async (
  address: string,
  constructorArguments: unknown[] = []
) => {
  try {
    console.log("Sleeping for 10 seconds before verification...");
    await sleep(10000);
    console.log("\n>>>>>>>>>>>> Verification >>>>>>>>>>>>\n");

    console.log("Verifying: ", address);
    await run("verify:verify", {
      address,
      constructorArguments,
    });
  } catch (error) {
    if (
      error instanceof NomicLabsHardhatPluginError &&
      error.message.includes("Reason: Already Verified")
    ) {
      console.log("Already verified, skipping...");
    } else {
      console.error(error);
    }
  }
};

// add 10%
export const calculateGasMargin = (
  value: ethers.BigNumber
): ethers.BigNumber => {
  return value
    .mul(ethers.BigNumber.from(10000).add(ethers.BigNumber.from(1000)))
    .div(ethers.BigNumber.from(10000));
};

export const getManifest = (network: string) => {
  if (network === "mainnet" || network === "tenderlyMainnet") {
    return manifestMainnet;
  }
  if (network === "sepolia" || network === "tenderlySepolia") {
    return manifestSepolia;
  }
  if (network === "arbitrumOne") {
    return manifestArbitrumOne;
  }
  return undefined;
}