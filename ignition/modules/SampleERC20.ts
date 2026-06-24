import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SampleERC20Module", (m) => {
  const initialHolder = m.getAccount(0);
  const token = m.contract("SampleERC20", [initialHolder]);

  return { token };
});
