import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEventLogs } from "viem";

describe("GameResultRegistry (Fuji)", async function () {
  const { viem } = await network.connect({
    network: "fuji",
  });

  const publicClient = await viem.getPublicClient();

  it("should emit GameRegistered when regist is called", async function () {
    const registry = await viem.deployContract("GameResultRegistry");

    const gameId = "550e8400-e29b-41d4-a716-446655440000";
    const p1Id = "3f8a9c2e-6d7b-4f5a-9c1e-2a7e8d4b91c3";
    const p2Id = "a1c2e3f4-5678-4abc-9def-0123456789ab";
    const p1Score = 4;
    const p2Score = 2;

    const txHash = await registry.write.regist([
      gameId,
      p1Id,
      p2Id,
      p1Score,
      p2Score,
    ]);

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    const logs = await publicClient.getLogs({
      address: registry.address,
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    const parsed = parseEventLogs({
      abi: registry.abi,
      logs,
    });

    const event = parsed[0];
    assert.equal(event.eventName, "GameRegistered");

    const args = event.args as any;

    assert.equal(args.gameId, gameId);
    assert.equal(args.player1Id, p1Id);
    assert.equal(args.player2Id, p2Id);
    assert.equal(args.player1Score, p1Score);
    assert.equal(args.player2Score, p2Score);
    assert.ok(args.registedAt > 0n);
  });
});
