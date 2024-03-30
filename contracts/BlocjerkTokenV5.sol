// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

import {BlocjerkTokenV4WithVersion} from "./BlocjerkTokenV4WithVersion.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Uniswap} from "./core/Uniswap.sol";
import {console} from "hardhat/console.sol";

/**
 * [Changes from BlocjerkTokenV4WithVersion]
 * - Set minimum token amount to sell tax fee
 * - Add upgradeToV5 function to set version
 * - Sell accumulated tax fee for ETH through Uniswap V2 Router
 *  and send ETH to taxTo wallet address when regular transfer
 */
contract BlocjerkTokenV5 is BlocjerkTokenV4WithVersion, Uniswap {
  event SoldTax(uint256 tokensSold, uint256 ethReceived);
  event SetMinTaxForSell(uint256 minTaxForSell);

  // Minimum token amount, if accumulated tax tokens is over minTaxForSell,
  // immediately sell tax for ETH and send to taxTo address.
  uint256 public minTaxForSell;

  // @deprecated, unused variable
  address public USDT;

  bool internal inTriggerProcess;
  modifier lockTheProcess() {
    inTriggerProcess = true;
    _;
    inTriggerProcess = false;
  }

  /**
   * @dev Must call this just after the upgrade deployment, to update state
   * variables and execute other upgrade logic.
   * Ref: https://github.com/OpenZeppelin/openzeppelin-upgrades/issues/62
   */
  function upgradeToV5() external {
    require(version < 5, "DeHubToken: Already upgraded to version 5");
    version = 5;
    console.log("v", version);
  }

  function setUSDT(address USDT_) external onlyOwner {
    USDT = USDT_;
  }

  function setMinTaxForSell(uint256 minTaxForSell_) external onlyOwner {
    require(minTaxForSell != minTaxForSell_);
    minTaxForSell = minTaxForSell_;
    emit SetMinTaxForSell(minTaxForSell_);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal virtual override {
    super._beforeTokenTransfer(from, to, amount);

    TransactionType txType = _getTransactionType(from, to);
    // In order to avoid falling into a tx loop,
    // sell tax fee for ETH if current transaction is not buying or selling
    if (!inTriggerProcess && txType == TransactionType.REGULAR) {
      _triggerSellTax();
    }
  }

  function _takeFee(
    address sender,
    address recipient,
    uint256 amount
  ) internal virtual override returns (uint256) {
    if (inTriggerProcess) {
      return 0;
    }
    return super._takeFee(sender, recipient, amount);
  }

  function _canSellTax(
    uint256 contractTokenBalance
  ) internal view virtual returns (bool) {
    return contractTokenBalance >= minTaxForSell && minTaxForSell > 0;
  }

  function _triggerSellTax() internal virtual {
    uint256 contractTokenBalance = balanceOf(address(this));
    if (_canSellTax(contractTokenBalance)) {
      _sellTax(contractTokenBalance);
    }
  }

  function _sellTax(uint256 tokenAmount) internal virtual lockTheProcess {
    uint256 tokensSold;
    uint256 ethReceived;

    if (
      taxTo != address(0) &&
      tokenAmount > 0 &&
      address(uniswapV2Router) != address(0)
    ) {
      // Must approve before swapping
      _approve(address(this), address(uniswapV2Router), tokenAmount);

      ethReceived = swapTokensForETH(tokenAmount);
      if (ethReceived > 0) {
        tokensSold = tokenAmount;
        payable(taxTo).transfer(ethReceived);
      }
    }
    emit SoldTax(tokensSold, ethReceived);
  }
}
