import * as hre from "hardhat";
import { IUniswapRouter02__factory, IWETH__factory, TestUniswapV3__factory } from "../../typechain";

const main = async () => {
  const deployers = await hre.ethers.getSigners();
  let deployer = deployers[0];

  if (hre.network.name !== "tenderly" && hre.network.name !== "hardhat") {
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
  } else if (hre.network.name === "tenderly") {
    await hre.network.provider.send("tenderly_setBalance", [
      deployer.address,
      hre.ethers.utils.parseEther("1000").toHexString(),
    ]);
  }
  
  console.log("deployer.address", deployer.address);

  const chainId = String(await deployer.getChainId());

  const balance = await deployer.getBalance();
  console.log("Balance", balance.toString());
  
  const TestUniswapV3Factory = new TestUniswapV3__factory(deployer);
  const testUniswapV3 = await TestUniswapV3Factory.deploy();
  await testUniswapV3.deployTransaction.wait();
  console.log("TestUniswapV3", testUniswapV3.address);
  console.log("owner", await testUniswapV3.owner());

  const config = {
    "1": {
      router: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    },
    "11155111": {
      router: "0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E",
      dai: "0x68194a729C2450ad26072b3D33ADaCbcef39D574",
    }
  }

  await testUniswapV3.setUniswapV3Router((config as any)[chainId].router);
  console.log(`set router: ${(config as any)[chainId].router}`);

  const router = IUniswapRouter02__factory.connect((config as any)[chainId].router, deployer);
  const wETHAddress = await router.WETH9();
  console.log(`wETH: ${wETHAddress}`);

  const amount = hre.ethers.utils.parseEther("100");
  console.log("amount", amount.toString());
  const WETH = IWETH__factory.connect(wETHAddress, deployer);
  await WETH.deposit({ value: amount });
  console.log("WETH balance", (await WETH.balanceOf(deployer.address)).toString());
  
  await WETH.approve(testUniswapV3.address, amount);
  console.log("approve testUniswapV3");

  await testUniswapV3.swapExactInputSingle(
    wETHAddress, // WETH
    (config as any)[chainId].dai,
    "0x1036c5BE9cD90febbeE0DB547c83D3baB70795f8", // recipient
    3000,
    amount
  );
  console.log("swap weth for dai");
}

main().catch((err) => console.error(err));