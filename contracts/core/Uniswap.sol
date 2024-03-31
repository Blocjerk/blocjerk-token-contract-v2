// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IUniswapV2Factory} from "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

// @deprecated
abstract contract Uniswap is OwnableUpgradeable {
  using SafeMathUpgradeable for uint256;
  // Using Uniswap lib, because Uniswap forks are trash ATM...
  IUniswapV2Router02 internal uniswapV2Router;
  // We will call createPair() when we decide. To avoid snippers and bots.
  address internal uniswapV2Pair;
  // This will be set when we call initDEXRouter().
  address internal routerAddr;

  // To receive ETH from uniswapV2Router when swaping
  receive() external payable {}

  function setUniswapV2Router(address router, address pair) external onlyOwner {
    require(router != address(0));
    uniswapV2Router = IUniswapV2Router02(router);
    uniswapV2Pair = pair;
    emit RouterSet(router, pair);
  }

  /**
   * @notice Swaps passed tokens for ETH using Uniswap router and returns
   * actual amount received.
   */
  function swapTokensForETH(uint256 tokenAmount) internal returns (uint256) {
    if (address(uniswapV2Router) != address(0)) {
      uint256 initialBalance = address(this).balance;
      // generate the uniswap pair path of token -> weth
      address[] memory path = new address[](2);
      path[0] = address(this);
      path[1] = uniswapV2Router.WETH();

      // Make the swap
      uniswapV2Router.swapExactTokensForETHSupportingFeeOnTransferTokens(
        tokenAmount,
        0, // accept any amount of ETH
        path,
        address(this),
        block.timestamp
      );

      uint256 ethReceived = address(this).balance.sub(initialBalance);
      return ethReceived;
    }
    return 0;
  }

  function swapTokensByPath(
    uint256 tokenAmountIn,
    uint256 tokenAmountOutMin,
    address[] memory path,
    address to
  ) internal {
    if (address(uniswapV2Router) != address(0)) {
      // Make the swap
      uniswapV2Router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
        tokenAmountIn,
        tokenAmountOutMin,
        path,
        to,
        block.timestamp
      );
    }
  }

  /* --------------------------------- Events --------------------------------- */
  event RouterSet(address indexed router, address indexed pair);

  /* -------------------------------- Modifiers ------------------------------- */
  modifier pcsInitialized() {
    require(routerAddr != address(0), "Router address has not been set!");
    _;
  }
}
