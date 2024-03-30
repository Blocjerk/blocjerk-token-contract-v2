// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IUniswapRouter02} from "../interfaces/IUniswapRouter02.sol";

interface IWETH is IERC20 {
  function deposit() external payable;

  function withdraw(uint amount) external;
}

contract TestUniswapV3 is Ownable {
  // Address to SwapRouter02
  IUniswapRouter02 internal uniswapV3Router;

  function setUniswapV3Router(address router) external onlyOwner {
    require(router != address(0));
    uniswapV3Router = IUniswapRouter02(router);
  }

  function swapExactInputSingle(
    address tokenIn,
    address tokenOut,
    address recipient,
    uint24 poolFee,
    uint amountIn
  ) external returns (uint256 amountOut) {
    if (address(uniswapV3Router) != address(0)) {
      // Transfer the specified amount of DAI to this contract.
      TransferHelper.safeTransferFrom(
        tokenIn,
        msg.sender,
        address(this),
        amountIn
      );

      // Approve the router to spend DAI.
      TransferHelper.safeApprove(tokenIn, address(uniswapV3Router), amountIn);

      //IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
      //IERC20(tokenIn).approve(address(router), amountIn);

      IUniswapRouter02.ExactInputSingleParams memory params = IUniswapRouter02
        .ExactInputSingleParams({
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          fee: poolFee,
          recipient: recipient,
          amountIn: amountIn,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0
        });

      amountOut = uniswapV3Router.exactInputSingle(params);
    }
  }
}
