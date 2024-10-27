import React, { useEffect, useState } from "react";
import { useWallet } from "@/contexts/wallet-context";
import { ClipboardCheck, Copy, AlertCircle } from "lucide-react";
import { getFhevmInstance } from "@/fhevmjs/fhevm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "./header";
import { CONTRACT_STORAGE_KEY } from "@/utils/constants";

const toHexString = (bytes) => {
  return bytes.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
};

const UINT_LIMITS = {
  uint4: { min: 0, max: 15 },
  uint8: { min: 0, max: 255 },
  uint16: { min: 0, max: 65535 },
  uint32: { min: 0, max: 4294967295 },
  uint64: { min: 0, max: BigInt("18446744073709551615") },
};

const Connected = () => {
  const { address } = useWallet();
  const [contractAddress, setContractAddress] = useState("");
  const [showContractInput, setShowContractInput] = useState(false);
  const [instance, setInstance] = useState(null);
  const [values, setValues] = useState({
    uint4: 0,
    uint8: 0,
    uint16: 0,
    uint32: 0,
    uint64: 0,
  });
  const [errors, setErrors] = useState({
    uint4: "",
    uint8: "",
    uint16: "",
    uint32: "",
    uint64: "",
  });
  const [proofs, setProofs] = useState({
    uint4: { proof: "0x0", handle: "0x0" },
    uint8: { proof: "0x0", handle: "0x0" },
    uint16: { proof: "0x0", handle: "0x0" },
    uint32: { proof: "0x0", handle: "0x0" },
    uint64: { proof: "0x0", handle: "0x0" },
  });

  useEffect(() => {
    const savedAddress = localStorage.getItem(CONTRACT_STORAGE_KEY);
    if (savedAddress) {
      setContractAddress(savedAddress);
      initializeFhevm(savedAddress);
    } else {
      setShowContractInput(true);
    }
  }, []);

  const initializeFhevm = async (address) => {
    try {
      const instance = await getFhevmInstance();
      setInstance(instance);
    } catch (error) {
      console.error("Failed to initialize FHEVM:", error);
    }
  };

  const handleContractSubmit = (e) => {
    e.preventDefault();
    if (contractAddress) {
      localStorage.setItem(CONTRACT_STORAGE_KEY, contractAddress);
      initializeFhevm(contractAddress);
      setShowContractInput(false);
    }
  };

  const handleContractChange = (newAddress) => {
    if (newAddress) {
      setContractAddress(newAddress);
      localStorage.setItem(CONTRACT_STORAGE_KEY, newAddress);
      initializeFhevm(newAddress);
    }
  };

  const validateAndSetValue = (type, value) => {
    const numValue = Number(value);
    const { min, max } = UINT_LIMITS[type];

    if (isNaN(numValue)) {
      setErrors((prev) => ({ ...prev, [type]: "Please enter a valid number" }));
      return false;
    }

    if (numValue < min || numValue > max) {
      setErrors((prev) => ({
        ...prev,
        [type]: `Value must be between ${min} and ${max}`,
      }));
      return false;
    }

    setErrors((prev) => ({ ...prev, [type]: "" }));
    return true;
  };

  const handleInputChange = async (type, value) => {
    try {
      if (!validateAndSetValue(type, value)) {
        setValues((prev) => ({ ...prev, [type]: value }));
        return;
      }

      setValues((prev) => ({ ...prev, [type]: value }));

      const input = await instance.createEncryptedInput(
        contractAddress,
        address
      );

      const numValue = Number(value);
      switch (type) {
        case "uint4":
          await input.add4(numValue);
          break;
        case "uint8":
          await input.add8(numValue);
          break;
        case "uint16":
          await input.add16(numValue);
          break;
        case "uint32":
          await input.add32(numValue);
          break;
        case "uint64":
          await input.add64(numValue);
          break;
        default:
          await input.add64(numValue);
      }

      const encryptedInput = await input.encrypt();

      setProofs((prev) => ({
        ...prev,
        [type]: {
          proof: "0x" + toHexString(encryptedInput.inputProof),
          handle: "0x" + toHexString(encryptedInput.handles[0]),
        },
      }));
    } catch (error) {
      console.error(`Error encrypting ${type}:`, error);
      setErrors((prev) => ({
        ...prev,
        [type]: `Error encrypting value: ${error.message}`,
      }));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const renderUintSection = (type) => {
    const { min, max } = UINT_LIMITS[type];
    const baseInputClass =
      "w-full border border-[#1E3A8A] p-3 py-5 text-white font-mono focus:outline-none focus:border-[#1E3A8A] bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

    const CopyableInput = ({ value, onCopy }) => {
      const [isCopied, setIsCopied] = useState(false);

      const handleCopy = () => {
        onCopy();
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      };

      return (
        <div className="flex w-full">
          <input
            type="text"
            value={value}
            readOnly
            className={`${baseInputClass} border-r-0 rounded-l`}
          />
          <button
            onClick={handleCopy}
            className="px-4 border border-[#1E3A8A] border-l-0 rounded-r hover:bg-white/5 transition-colors"
          >
            {isCopied ? (
              <ClipboardCheck className="w-5 h-5 text-white/80" />
            ) : (
              <Copy className="w-5 h-5 text-white/80" />
            )}
          </button>
        </div>
      );
    };

    return (
      <div className="grid place-items-center w-full">
        <div className="flex flex-col w-full items-center gap-4 max-w-2xl">
          <div className="flex flex-col w-full gap-2">
            <div className="flex gap-4">
              <div className="text-white/80 text-right font-mono w-40 md:flex hidden"></div>
              {errors[type] && (
                <Alert variant="destructive" className="mt-2">
                  <div className="flex gap-3 items-center">
                    <AlertCircle className="h-4 w-4" />
                    <div>{errors[type]}</div>
                  </div>
                </Alert>
              )}
            </div>

            <div className="flex items-center w-full gap-4">
              <div className="text-white/80 md:text-right font-mono md:w-40 w-12">
                {type}
              </div>
              <input
                type="number"
                value={values[type]}
                onChange={(e) => handleInputChange(type, e.target.value)}
                className={`${baseInputClass} rounded ${
                  errors[type] ? "border-red-500" : ""
                }`}
                min={min}
                max={max}
              />
            </div>
          </div>

          <div className="flex items-center w-full gap-4">
            <div className="text-white/80 md:text-right font-mono md:w-40 w-12">
              Input Handle
            </div>
            <CopyableInput
              value={proofs[type].handle}
              onCopy={() => copyToClipboard(proofs[type].handle)}
            />
          </div>

          <div className="flex items-center w-full gap-4">
            <div className="text-white/80 md:text-right font-mono md:w-40 w-12">
              Input Proof
            </div>
            <CopyableInput
              value={proofs[type].proof}
              onCopy={() => copyToClipboard(proofs[type].proof)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#020B20] flex flex-col">
      <Header address={address} onContractChange={handleContractChange} />

      <div className="flex-1 px-12 pt-20">
        {showContractInput ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-white/70 py-8">
              <p>Please enter the contract address to continue.</p>
            </div>

            <form onSubmit={handleContractSubmit} className="flex gap-4">
              <input
                className="w-full border border-[#1E3A8A] p-3 py-5 text-white font-mono focus:outline-none focus:border-[#1E3A8A] bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg"
                type="text"
                placeholder="Contract Address (0x...)"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />

              <button
                type="submit"
                className="bg-[#1E3A8A] p-3 py-5 text-white font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg w-60"
              >
                Set Contract
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-16 pb-20">
            {instance && (
              <>
                {renderUintSection("uint4")}
                {renderUintSection("uint8")}
                {renderUintSection("uint16")}
                {renderUintSection("uint32")}
                {renderUintSection("uint64")}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Connected;
