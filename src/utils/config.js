import { flowConfig } from "@onflow/fcl-config";
import { config } from "@onflow/config";

export const get = (scope, path, fallback) => {
  if (typeof path === "string") return get(scope, path.split("/"), fallback);
  if (!path.length) return scope;
  try {
    const [head, ...rest] = path;
    return get(scope[head], rest, fallback);
  } catch (_error) {
    return fallback;
  }
};

export const set = (key, env, conf, fallback) => {
  config().put(key, env || get(flowConfig(), conf, fallback));
};

export const getConfigValue = async (param) => {
  return config().get(param)
}
