import { set } from "./config";
import { getManagerAddress, initManager } from "./init-manager";
import { getAccount } from "./create-account";

export const init = async () => {
  set("PRIVATE_KEY", process.env.PK, "accounts/service/privateKey");
  set(
    "SERVICE_ADDRESS",
    process.env.SERVICE_ADDRESS,
    "accounts/service/address",
    "f8d6e0586b0a20c7"
  );
  set(
    "accessNode.api",
    process.env.ACCESS_NODE,
    "wallet/accessNode",
    "http://localhost:8080"
  );

  // Check manager account and setup MANGER_ADDRESS param
  let managerAddress;
  try {
    console.log("✅ manager exists");
    managerAddress = await getManagerAddress();
  } catch (e) {
    console.log("➕ create new manager");
    managerAddress = await initManager();
  }

  set(
    "MANAGER_ADDRESS",
    process.env.MANAGER_ADDRESS,
    "accounts/manager/address",
    managerAddress
  );

  await getAccount("test-account");
};
