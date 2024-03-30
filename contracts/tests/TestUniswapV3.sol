// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWETH is IERC20 {
  function deposit() external payable;

  function withdraw(uint amount) external;
}

contract TestUniswapV3 is Ownable {
  ISwapRouter internal uniswapV3Router;

  function setUniswapV3Router(address router) external onlyOwner {
    require(router != address(0));
    uniswapV3Router = ISwapRouter(router);
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

      ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
        .ExactInputSingleParams({
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          fee: poolFee,
          recipient: recipient,
          deadline: block.timestamp,
          amountIn: amountIn,
          amountOutMinimum: 0,
          sqrtPriceLimitX96: 0
        });

      amountOut = uniswapV3Router.exactInputSingle(params);
    }
  }
}
