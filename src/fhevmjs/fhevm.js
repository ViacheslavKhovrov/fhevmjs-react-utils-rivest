import { BrowserProvider } from "ethers";
import { createInstance, initFhevm } from "fhevmjs";

let fhevmInstance = null;

export const createFhevmInstance = async () => {
  if (!fhevmInstance) {
    await initFhevm();
    fhevmInstance = await createInstance({
      chainId: 21097,
      networkUrl: "https://validator.rivest.inco.org/",
      gatewayUrl: "https://gateway.rivest.inco.org/",
      aclAddress: "0x2Fb4341027eb1d2aD8B5D9708187df8633cAFA92",
    });
  }
  return fhevmInstance;
};

export const getFhevmInstance = async () => {
  if (!fhevmInstance) {
    fhevmInstance = await createFhevmInstance();
  }
  return fhevmInstance;
};
