import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("GameResultRegistryModule", (m) => {
  const registry = m.contract("GameResultRegistry");
  return { registry };
});
