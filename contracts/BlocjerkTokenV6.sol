// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BlocjerkTokenV5} from "./BlocjerkTokenV5.sol";
import {UniswapV3} from "./core/UniswapV3.sol";
import {console} from "hardhat/console.sol";

/**
 * [Changes from BlocjerkTokenV5]
 * - Sell accumulated tax fee for ETH through Uniswap V3 Router
 *  and send ETH to taxTo wallet address when regular transfer
 */
contract BlocjerkTokenV6 is BlocjerkTokenV5, UniswapV3 {
  /**
   * @dev Must call this just after the upgrade deployment, to update state
   * variables and execute other upgrade logic.
   * Ref: https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/62
   */
  function upgradeToV6() external {
    require(version < 6, "DeHubToken: Already upgraded to version 6");
    version = 6;
    console.log("v", version);
  }

  function _sellTax(
    uint256 tokenAmount
  ) internal virtual override lockTheProcess {
    uint256 tokensSold;
    uint256 ethReceived;

    if (
      taxTo != address(0) &&
      tokenAmount > 0 &&
      address(uniswapV3Router) != address(0)
    ) {
      ethReceived = swapExactInputSingle(
        address(this),
        uniswapV3Router.WETH9(),
        taxTo,
        3000, // 0.3%
        tokenAmount
      );
      tokensSold = tokenAmount;
    }
    emit SoldTax(tokensSold, ethReceived);
  }
}
