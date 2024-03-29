import { ethers } from "ethers";

export type Network =
  | "mainnet"
  // | "goerli"
  | "sepolia"
  | "arbitrumGoerli"
  | "arbitrumOne"
  // | "polygon"
  // | "polygonMumbai"
  // | "bsc"
  // | "bscTestnet";

interface Config {
  ownerAddress: string;
  treasuryAddress: string;
  totalSupply: ethers.BigNumber;
  name: string;
  symbol: string;
}

const oneMillion = 10 ** 6; // 1000000
const oneBillion = 10 ** 9; // 1000000000
const numDecimals = 18;
// token has 18 decimal places
const decimals = ethers.BigNumber.from(10).pow(numDecimals);

export const config: { [network in Network]: Config } = {
  mainnet: {
    ownerAddress: "0x9F29801aC82befe279786E5691B0399b637C560c",
    treasuryAddress: "0x9F29801aC82befe279786E5691B0399b637C560c",
    totalSupply: ethers.BigNumber.from(oneMillion)
      .mul(10)
      .mul(decimals),
    name: "Blocjerk",
    symbol: "BJ",
  },
  // goerli: {
  //   ownerAddress: "0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF",
  //   treasuryAddress: "0xc2cd62B57CBC991beDaC0D49AdCc12F10A9Dc7c0",
  //   totalSupply: ethers.BigNumber.from(oneMillion)
  //     .mul(10)
  //     .mul(decimals),
  //   name: "Blocjerk",
  //   symbol: "BJ",
  // },
  sepolia: {
    ownerAddress: "0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF",
    treasuryAddress: "0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF",
    totalSupply: ethers.BigNumber.from(oneMillion)
      .mul(10)
      .mul(decimals),
    name: "Blocjerk",
    symbol: "BJ",
  },
  // polygon: {
  //   ownerAddress: "0x9F29801aC82befe279786E5691B0399b637C560c",
  //   treasuryAddress: "0x9F29801aC82befe279786E5691B0399b637C560c",
  //   totalSupply: ethers.BigNumber.from(oneMillion)
  //     .mul(10)
  //     .mul(decimals),
  //   name: "Blocjerk",
  //   symbol: "BJ",
  // },
  // polygonMumbai: {
  //   ownerAddress: "0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF",
  //   treasuryAddress: "0xc2cd62B57CBC991beDaC0D49AdCc12F10A9Dc7c0",
  //   totalSupply: ethers.BigNumber.from(oneMillion)
  //     .mul(10)
  //     .mul(decimals),
  //   name: "Blocjerk",
  //   symbol: "BJ",
  // },
  // bsc: {
  //   ownerAddress: "0x9F29801aC82befe279786E5691B0399b637C560c",
  //   treasuryAddress: "0x9F29801aC82befe279786E5691B0399b637C560c",
  //   totalSupply: ethers.BigNumber.from(oneMillion)
  //     .mul(10)
  //     .mul(decimals),
  //   name: "Blocjerk",
  //   symbol: "BJ",
  // },
  // bscTestnet: {
  //   ownerAddress: "0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF",
  //   treasuryAddress: "0xc2cd62B57CBC991beDaC0D49AdCc12F10A9Dc7c0",
  //   totalSupply: ethers.BigNumber.from(oneMillion)
  //     .mul(10)
  //     .mul(decimals),
  //   name: "Blocjerk",
  //   symbol: "BJ",
  // },
  arbitrumOne: {
    ownerAddress: "0x394ee51b4a2415e89c1bb2de46d3eB3dE8dc96dC",
    treasuryAddress: "0x394ee51b4a2415e89c1bb2de46d3eB3dE8dc96dC",
    totalSupply: ethers.BigNumber.from(oneMillion)
      .mul(10)
      .mul(decimals),
    name: "Blocjerk",
    symbol: "BJ",
  },
  arbitrumGoerli: {
    ownerAddress: "0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF",
    treasuryAddress: "0xD3b5134fef18b69e1ddB986338F2F80CD043a1AF",
    totalSupply: ethers.BigNumber.from(oneMillion)
      .mul(10)
      .mul(decimals),
    name: "Blocjerk",
    symbol: "BJ",
  },
};
