# Blocjerk Token Contract

Blocjerk Token is updated version of $BJ as an upgradeable contract, forked version of $DHB (v2, implementation v4).

## Deployment

Execute the following command to deploy $BJ on the network
```bash
npm run deploy [network name]
```

i.e. if you want to deploy on mainnet,
```bash
npm run deploy mainnet
```

## Upgrade contract

Make sure you have already updated contract with new version.
i.e. BlocjerkTokenV4 was updated on top of BlocjerkTokenV3.

1. Deploy implementation contract

```bash
npm run impl [network name]
```

2. Open ProxyAdmin contract on etherscan

Open etherscan.io and go to the address of ProxyAdmin contract, you can find the address in `.openzeppelin/[network].json`.

```json
  "admin": {
    "address": "0xE473C3e0B277255Baf321A75fcf6Ce2C279cD278",
    "txHash": "0x0c5672927fa1bf49be48f4830dd4831d83575c4ceb131d29d8deba787a14eb48"
  },
```

`admin.address` is the address to ProxyAdmin contract.

3. Update implementation address with new one

Write the contract by calling `upgrade`
```javascript
upgrade(
  [proxy address], // $BJ contract address
  [new implementation address] // newly deployed BlockjerkTokenV4 contract
)
```

Open $BJ contract on etherscan and confirm that contract was upgraded.

## Operations TODO against BlocjerkTokenV6 upgrades

NOTE: $BJ will be added liquidity on Uniswap V2 with $WETH

- Call `addPoolToTax` or `removePoolToTax` to add or remove liquidity pools where takes tax fees of buying or selling
- Call `setTaxTo` to set target address where tax fees will be transfered directly after swapping for WETH
- Call `setMinTaxForSell` to set minimum tax fee amount to sell for ETH
- Call `setUniswapV2Router` to set Uniswap V2 Router and Pair address($BJ + $WETH)
- Finally call `upgradeToV6` to mark all the setting is done


## Contract Addresses

Network | Contract Address
--- | ---
Ethereum | 0x9cAAe40DCF950aFEA443119e51E821D6FE2437ca
Arbitrum | 0x9cAAe40DCF950aFEA443119e51E821D6FE2437ca

### Pools

Network | Protocol | Pair | Contract Address
--- | --- | --- | ---
Ethereum | Uniswap V2 | $BJ+$WETH | 0x20dDbFd14F316D417f5B1a981B5Dc926a4dFd4D1
Arbitrum | Camelot V2 | $BJ+$WETH | 0xFE9C07b7bE828e9E60975843Eb78B720D636Dad7
Sepolia | Uniswap V2 | $BJ+$WETH | 0x0190512Ad8Be3Ff42063e12aB7E353A038c4ecF5
Sepolia | Uniswap V3 | $BJ+$WETH(0.3%) | 0xA282B4fEbE16588F329fDc6c0aeeE76b896fBec0

### Router

Network | Name | Contract Address
--- | --- | ---
Ethereum | Uniswap V2, UniswapV2Router02 | 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
Sepolia | Uniswap V2, UniswapV2Router02 | 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008
Ethereum | Uniswap V3, SmartRouter02 | 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45
Arbitrum | Uniswap V3, SmartRouter02 | 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45
Arbitrum | Camelot V2, CamelotRouter | 0xc873fEcbd354f5A56E00E710B90EF4201db2448d


## Development

### Run test 

```bash
npm run test
```

### How to use tenderly

Tenderly provides the nodes forked from the main nodes, such as Ethereum, Sepolia, etc.

In order to run test or deployment on tenderly's forked node, execute the following commands

```bash
npm run test --network tenderlySepolia
npm run deploy tenderlyMainnet
npm run upgrade tenderlyMainnet
```