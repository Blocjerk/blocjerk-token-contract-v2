// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

// Slight modifiations from base Open Zeppelin Contracts
// Consult /oz/README.md for more information
import "./oz/ERC20Upgradeable.sol";
import "./oz/ERC20SnapshotUpgradeable.sol";
import "./oz/ERC20PausableUpgradeable.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {console} from "hardhat/console.sol";

/**
 * [Changes from BlocjerkTokenV4]
 * - Check transaction type if buy or sell
 * - Accumulate buy and sell tax fees
 * - Transfer tax fees to token address
 * - Add version
 */
contract BlocjerkTokenV4WithVersion is
  OwnableUpgradeable,
  ERC20Upgradeable,
  ERC20PausableUpgradeable,
  ERC20SnapshotUpgradeable
{
  event AuthorizedSnapshotter(address account);
  event DeauthorizedSnapshotter(address account);
  event BuySellTaxRate(uint256 buyTaxRate, uint256 sellTaxRate);

  // Convenience enum to differentiate transaction types.
  enum TransactionType {
    REGULAR,
    TAX,
    SELL,
    BUY
  }

  // Mapping which stores all addresses allowed to snapshot
  mapping(address => bool) authorizedToSnapshot;

  // TaxRate is based on 100% as 10000
  // If buy tax rate is 5%, then set it with 500
  // If sell tax rate is 0.2%, then set it with 20
  uint256 public buyTaxRate;
  uint256 public sellTaxRate;

  // TaxRate can be set differently according to DEX, while $BJ token can be added liquidity in several pools
  // <address> is a pool address
  // If transfering from pool to user is buying tx,
  // If transfering to pool is selling tx
  mapping(address => bool) public poolsToTax;

  address public taxTo;

  // @deprecated do not use since V5
  uint256 internal accumulatedTax;

  uint256 public version;

  function initialize(
    string memory name,
    string memory symbol
  ) public initializer {
    __Ownable_init();
    __ERC20_init(name, symbol);
    __ERC20Snapshot_init();
    __ERC20Pausable_init();
  }

  // Call this on the implementation contract (not the proxy)
  function initializeImplementation() public initializer {
    __Ownable_init();
    _pause();
  }

  /**
   * Mints new tokens.
   * @param account the account to mint the tokens for
   * @param amount the amount of tokens to mint.
   */
  function mint(address account, uint256 amount) external onlyOwner {
    _mint(account, amount);
  }

  /**
   * Burns tokens from an address.
   * @param account the account to mint the tokens for
   * @param amount the amount of tokens to mint.
   */
  function burn(address account, uint256 amount) external onlyOwner {
    _burn(account, amount);
  }

  /**
   * Pauses the token contract preventing any token mint/transfer/burn operations.
   * Can only be called if the contract is unpaused.
   */
  function pause() external onlyOwner {
    _pause();
  }

  /**
   * Unpauses the token contract preventing any token mint/transfer/burn operations
   * Can only be called if the contract is paused.
   */
  function unpause() external onlyOwner {
    _unpause();
  }

  /**
   * Creates a token balance snapshot. Ideally this would be called by the
   * controlling DAO whenever a proposal is made.
   */
  function snapshot() external returns (uint256) {
    require(
      authorizedToSnapshot[_msgSender()] || _msgSender() == owner(),
      "zDAOToken: Not authorized to snapshot"
    );
    return _snapshot();
  }

  /**
   * Authorizes an account to take snapshots
   * @param account The account to authorize
   */
  function authorizeSnapshotter(address account) external onlyOwner {
    require(
      !authorizedToSnapshot[account],
      "zDAOToken: Account already authorized"
    );

    authorizedToSnapshot[account] = true;
    emit AuthorizedSnapshotter(account);
  }

  /**
   * Deauthorizes an account to take snapshots
   * @param account The account to de-authorize
   */
  function deauthorizeSnapshotter(address account) external onlyOwner {
    require(authorizedToSnapshot[account], "zDAOToken: Account not authorized");

    authorizedToSnapshot[account] = false;
    emit DeauthorizedSnapshotter(account);
  }

  /**
   * Utility function to transfer tokens to many addresses at once.
   * @param recipients The addresses to send tokens to
   * @param amounts The amounts of tokens to send
   * @return Boolean if the transfer was a success
   */
  function transferBulk(
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external onlyOwner returns (bool) {
    require(!paused(), "ERC20Pausable: token transfer while paused");
    require(recipients.length == amounts.length, "Invalid arguments length");

    address sender = _msgSender();

    uint256 length = recipients.length;
    uint256 total = 0;
    for (uint256 i = 0; i < length; ++i) {
      total += amounts[i];
    }
    require(
      _balances[sender] >= total,
      "ERC20: transfer amount exceeds balance"
    );

    _balances[sender] -= total;
    _updateAccountSnapshot(sender);

    for (uint256 i = 0; i < length; ++i) {
      address recipient = recipients[i];
      require(recipient != address(0), "ERC20: transfer to the zero address");

      // Note: _beforeTokenTransfer isn't called here
      // This function emulates what it would do (paused and snapshot)

      _balances[recipient] += amounts[i];

      _updateAccountSnapshot(recipient);

      emit Transfer(sender, recipient, amounts[i]);
    }

    return true;
  }

  /**
   * Utility function to transfer tokens to many addresses at once.
   * @param sender The address to send the tokens from
   * @param recipients The addresses to send tokens to
   * @param amounts The amounts of tokens to send
   * @return Boolean if the transfer was a success
   */
  function transferFromBulk(
    address sender,
    address[] calldata recipients,
    uint256[] calldata amounts
  ) external onlyOwner returns (bool) {
    require(!paused(), "ERC20Pausable: token transfer while paused");
    require(recipients.length == amounts.length, "Invalid arguments length");

    uint256 length = recipients.length;
    uint256 total = 0;
    for (uint256 i = 0; i < length; ++i) {
      total += amounts[i];
    }
    require(
      _balances[sender] >= total,
      "ERC20: transfer amount exceeds balance"
    );

    // Ensure enough allowance
    uint256 currentAllowance = _allowances[sender][_msgSender()];
    require(
      currentAllowance >= total,
      "ERC20: transfer total exceeds allowance"
    );
    _approve(sender, _msgSender(), currentAllowance - total);

    _balances[sender] -= total;
    _updateAccountSnapshot(sender);

    for (uint256 i = 0; i < length; ++i) {
      address recipient = recipients[i];
      require(recipient != address(0), "ERC20: transfer to the zero address");

      // Note: _beforeTokenTransfer isn't called here
      // This function emulates what it would do (paused and snapshot)

      _balances[recipient] += amounts[i];

      _updateAccountSnapshot(recipient);

      emit Transfer(sender, recipient, amounts[i]);
    }

    return true;
  }

  function burnBulk(
    address[] calldata accounts,
    uint256[] calldata amounts
  ) external onlyOwner {
    require(accounts.length == amounts.length, "Invalid argument");
    uint256 len = accounts.length;
    for (uint256 i = 0; i < len; ++i) {
      _burn(accounts[i], amounts[i]);
    }
  }

  /**
   * Set Buy and Sell tax rate, 100% is based on 10000, i.e. 5% should input 500
   * @dev Only callable by owner
   */
  function setBuySellTaxRate(
    uint256 buyTaxRate_,
    uint256 sellTaxRate_
  ) external onlyOwner {
    require(buyTaxRate != buyTaxRate_ || sellTaxRate != sellTaxRate_);

    buyTaxRate = buyTaxRate_;
    sellTaxRate = sellTaxRate_;

    emit BuySellTaxRate(buyTaxRate_, sellTaxRate_);
  }

  /**
   * Set target wallet address that send tax to
   * @dev Only callable by owner
   */
  function setTaxTo(address taxTo_) external onlyOwner {
    require(taxTo != taxTo_);

    taxTo = taxTo_;
  }

  function addPoolToTax(address pool_) external onlyOwner {
    require(pool_ != address(0));

    poolsToTax[pool_] = true;
  }

  function removePoolToTax(address pool_) external onlyOwner {
    require(pool_ != address(0));

    poolsToTax[pool_] = false;
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 amount
  )
    internal
    virtual
    override(
      ERC20PausableUpgradeable,
      ERC20SnapshotUpgradeable,
      ERC20Upgradeable
    )
  {
    bool alreadyPaused = paused();
    if (to == address(0)) {
      if (alreadyPaused) {
        _unpause();
      }
    }
    super._beforeTokenTransfer(from, to, amount);
    if (to == address(0)) {
      if (alreadyPaused) {
        _pause();
      }
    }
  }

  function _transfer(
    address sender,
    address recipient,
    uint256 amount
  ) internal virtual override {
    uint256 taxAmount = _takeFee(sender, recipient, amount);

    // Transfer the amount minus the tax
    super._transfer(sender, recipient, amount - taxAmount);

    // Transfer the tax to token contract
    if (taxAmount > 0) {
      super._transfer(sender, address(this), taxAmount);
      accumulatedTax += taxAmount;
    }
  }

  function _takeFee(
    address sender,
    address recipient,
    uint256 amount
  ) internal virtual returns (uint256) {
    // Calculate the tax amount based on whether it is a buy or sell
    if (_getTransactionType(sender, recipient) == TransactionType.SELL) {
      // sending tokens to pool, sell transaction
      return (amount * sellTaxRate) / 10000;
    } else if (_getTransactionType(sender, recipient) == TransactionType.BUY) {
      // sending tokens from pool, buy transaction
      return (amount * buyTaxRate) / 10000;
    }
    return 0;
  }

  /**
   * @notice Helper function to determine what kind of transaction it is.
   * @param from transaction sender
   * @param to transaction receiver
   */
  function _getTransactionType(
    address from,
    address to
  ) internal view returns (TransactionType) {
    if (poolsToTax[from] && !poolsToTax[to]) {
      // LP -> addr
      return TransactionType.BUY;
    } else if (!poolsToTax[from] && poolsToTax[to]) {
      // addr -> LP
      return TransactionType.SELL;
    } else if (from == address(this) || to == address(this)) {
      return TransactionType.TAX;
    }
    return TransactionType.REGULAR;
  }
}
