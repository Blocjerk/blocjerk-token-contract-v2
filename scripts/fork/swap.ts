import * as hre from "hardhat";
import { IERC20__factory, IWETH__factory, TestParent__factory, TestUniswapV3, TestUniswapV3__factory } from "../../typechain";

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

  const balance = await deployer.getBalance();
  console.log("Balance", balance.toString());
  
  const TestUniswapV3Factory = new TestUniswapV3__factory(deployer);
  const testUniswapV3 = await TestUniswapV3Factory.deploy();
  await testUniswapV3.deployTransaction.wait();
  console.log("TestUniswapV3", testUniswapV3.address);
  console.log("owner", await testUniswapV3.owner());

  await testUniswapV3.setUniswapV3Router("0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45");
  console.log("set router: 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45");

  const amount = hre.ethers.utils.parseEther("100");
  console.log("amount", amount.toString());
  const WETH = IWETH__factory.connect("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", deployer);
  await WETH.deposit({ value: amount });
  console.log("WETH balance", (await WETH.balanceOf(deployer.address)).toString());
  
  await WETH.approve(testUniswapV3.address, amount);
  console.log("approve testUniswapV3");
  await testUniswapV3.swapExactInputSingle(
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
    "0x1036c5BE9cD90febbeE0DB547c83D3baB70795f8", // recipient
    3000,
    amount
  );
  console.log("swap weth for dai");

  //{"tokenIn":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","tokenOut":"0x6B175474E89094C44Da98b954EedeAC495271d0F","fee":3000,"recipient":"0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF","deadline":1811830805,"amountIn":"1000000000000000000","amountOutMinimum":0,"sqrtPriceLimitX96":0}
}

main().catch((err) => console.error(err));