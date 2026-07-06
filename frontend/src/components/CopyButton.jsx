import { useState } from "react";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button
      onClick={copy}
      className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
};

export default CopyButton;