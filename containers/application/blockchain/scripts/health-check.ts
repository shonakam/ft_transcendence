import { network } from "hardhat";
import GameResultRegistryAbi from
	"../artifacts/contracts/GameResultRegistry.sol/GameResultRegistry.json"

const { viem } = await network.connect({
  network: "fuji",
});

const publicClient = await viem.getPublicClient();

const result = await publicClient.readContract({
  address: "0xYourContractAddress",
  abi: GameResultRegistryAbi.abi,
  functionName: "health",
});

console.log("health:", result);
