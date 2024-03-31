import * as hre from "hardhat";
import { BlocjerkTokenV6__factory, IERC20__factory, IUniswapRouter02__factory, IWETH__factory, TestParent__factory, TestUniswapV3, TestUniswapV3__factory } from "../../typechain";
import { getManifest } from "../helpers";

const main = async () => {
  const deployers = await hre.ethers.getSigners();
  let deployer = deployers[0];

  if (hre.network.name !== "tenderlySepolia" && hre.network.name !== "tenderlyMainnet" && hre.network.name !== "hardhat") {
    console.log("network", hre.network.name);
    return;
  }

  if (hre.network.name === "hardhat") {
    // Impersonate account
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [deployer.address],
    });

    await hre.network.provider.send("hardhat_setBalance", [
      deployer.address,
      hre.ethers.utils.parseEther("1000").toHexString(),
    ]);
  } else if (hre.network.name === "tenderlySepolia" || hre.network.name === "tenderlyMainnet") {
    await hre.network.provider.send("tenderly_setBalance", [
      deployer.address,
      hre.ethers.utils.parseEther("1000").toHexString(),
    ]);
  }
  
  console.log("deployer.address", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Balance", balance.toString());

  const manifest = getManifest(hre.network.name);
  if (!manifest) {
    throw new Error(`Not found manifest for ${hre.network.name}`);
  }
  const proxyAddr = manifest.proxies[manifest.proxies.length - 1].address;
  console.log("proxyAddr", proxyAddr);

  const config = {
    pool: "0xc36442b4a4522e871399cd717abdd847ab11fe88", // BJ+WETH
    taxTo: deployer.address,
    minTaxForSell: hre.ethers.utils.parseEther("10"),
    uniswapV3Router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  }

  const blocjerkToken = BlocjerkTokenV6__factory.connect(proxyAddr, deployer);
  await blocjerkToken.addPoolToTax(config.pool);
  await blocjerkToken.setTaxTo(config.taxTo);
  await blocjerkToken.setMinTaxForSell(config.minTaxForSell);
  await blocjerkToken.setUniswapV3Router(config.uniswapV3Router);
}

main().catch((err) => console.error(err));