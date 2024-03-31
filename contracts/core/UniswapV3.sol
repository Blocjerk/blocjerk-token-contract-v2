// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ISwapRouter} from "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {IUniswapRouter02} from "../interfaces/IUniswapRouter02.sol";

abstract contract UniswapV3 is OwnableUpgradeable {
  // Mainnet: 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45
  // Address to SwapRouter02
  // https://github.com/Uniswap/swap-router-contracts/blob/main/contracts/SwapRouter02.sol
  IUniswapRouter02 internal uniswapV3Router;

  function setUniswapV3Router(address router) external onlyOwner {
    require(router != address(0));
    uniswapV3Router = IUniswapRouter02(router);
    emit UniswapV3RouterSet(router);
  }

  function swapExactInputSingle(
    address tokenIn,
    address tokenOut,
    address recipient,
    uint24 poolFee,
    uint amountIn
  ) internal returns (uint amountOut) {
    if (address(uniswapV3Router) != address(0)) {
      TransferHelper.safeTransferFrom(
        tokenIn,
        msg.sender,
        address(this),
        amountIn
      );

      // Approve the router to spend DAI.
      TransferHelper.safeApprove(tokenIn, address(uniswapV3Router), amountIn);

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

  /* --------------------------------- Events --------------------------------- */
  event UniswapV3RouterSet(address indexed router);

  /* -------------------------------- Modifiers ------------------------------- */
}
