import { set } from "./config";

export const init = async (basePath) => {
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

  set("BASE_PATH", process.env.BASE_PATH, "resolve/basePath", basePath);
};
