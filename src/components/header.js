import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { CONTRACT_STORAGE_KEY } from "@/utils/constants";
import { Menu } from "lucide-react";

const Header = ({ address, onContractChange = () => {} }) => {
  const [open, setOpen] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [newContractAddress, setNewContractAddress] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      const savedAddress = localStorage.getItem(CONTRACT_STORAGE_KEY);
      if (savedAddress) {
        setNewContractAddress(savedAddress);
        setError("");
      }
    }
  }, [open]);

  const isValidAddress = (address) => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setNewContractAddress(value);

    if (!value) {
      setError("");
      return;
    }

    if (!isValidAddress(value)) {
      setError(
        "Please enter a valid Ethereum address (0x followed by 40 hexadecimal characters)"
      );
    } else {
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newContractAddress) {
      setError("Contract address is required");
      return;
    }

    if (!isValidAddress(newContractAddress)) {
      setError("Please enter a valid Ethereum address");
      return;
    }

    onContractChange(newContractAddress);
    setError("");
    setOpen(false);
    setMenuOpen(false);
  };

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setMenuOpen(false);
    }
  };

  const MobileMenu = () => (
    <div
      className={`
      fixed top-16 right-4 z-50 bg-[#020B20] border border-[#1E3A8A] rounded-lg p-4 shadow-lg
      transform transition-all duration-200 ease-in-out
      ${
        menuOpen
          ? "translate-y-0 opacity-100"
          : "-translate-y-2 opacity-0 pointer-events-none"
      }
    `}
    >
      {address && (
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/5 justify-start"
            onClick={() => {
              setOpen(true);
              setMenuOpen(false);
            }}
          >
            Change Contract
          </Button>
          <div className="border border-[#1E3A8A] px-4 py-2 rounded text-white/80 font-mono text-sm">
            {address?.slice(0, 6)}...{address?.slice(-6)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-4 md:px-12 pt-6">
        <div className="hidden md:flex items-center gap-4">
          <Image
            src="/inco-logo.svg"
            alt="Gentry Logo"
            width={139}
            height={40}
          />
          <div className="flex items-center gap-2">
            <span className="text-[#72FF80] text-4xl">Rivest Testnet</span>
          </div>
        </div>

        {/* Mobile Logo */}
        <div className="flex md:hidden items-center gap-2">
          <Image
            src="/inco-logo.svg"
            alt="Gentry Logo"
            width={100}
            height={30}
          />
          <span className="text-[#72FF80] text-xl">Rivest Testnet</span>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {address && (
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/5"
              onClick={() => setOpen(true)}
            >
              Change Contract
            </Button>
          )}

          {address && (
            <div className="border border-[#1E3A8A] px-4 py-2 rounded text-white/80 font-mono">
              {address?.slice(0, 6)}...{address?.slice(-6)}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/5"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      <MobileMenu />

      {address && (
        <AlertDialog open={open} onOpenChange={handleOpenChange}>
          <AlertDialogContent className="bg-[#020B20] border-[#1E3A8A]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Change Contract Address
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/80">
                Enter the new contract address below.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Contract Address (0x...)"
                value={newContractAddress}
                onChange={handleAddressChange}
                className={`bg-transparent border-[#1E3A8A] text-white ${
                  error ? "border-red-500" : ""
                }`}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </div>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel
                className="w-full sm:w-auto bg-transparent border-[#1E3A8A] text-white hover:bg-white/15 hover:text-white/80"
                onClick={() => {
                  const savedAddress =
                    localStorage.getItem(CONTRACT_STORAGE_KEY);
                  setNewContractAddress(savedAddress || "");
                  setError("");
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSubmit}
                className={`w-full sm:w-auto bg-[#1E3A8A] text-white hover:bg-[#2A4494] ${
                  error || !newContractAddress
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                disabled={!!error || !newContractAddress}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Header;
