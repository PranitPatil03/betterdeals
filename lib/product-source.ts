export interface SourceBadge {
  label: string;
  className: string;
}

export function getSourceBadge(hostname: string): SourceBadge {
  const h = hostname.toLowerCase();

  if (h.includes("amazon")) {
    return {
      label: "Amazon",
      className: "bg-orange-100 text-orange-700 border-orange-200",
    };
  }

  if (h.includes("ebay")) {
    return {
      label: "eBay",
      className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
  }

  if (h.includes("walmart")) {
    return {
      label: "Walmart",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    };
  }

  if (h.includes("bestbuy") || h.includes("best-buy")) {
    return {
      label: "Best Buy",
      className: "bg-yellow-100 text-yellow-900 border-yellow-400",
    };
  }

  if (h.includes("flipkart")) {
    return {
      label: "Flipkart",
      className: "bg-indigo-100 text-indigo-700 border-indigo-200",
    };
  }

  if (h.includes("target")) {
    return {
      label: "Target",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  }

  if (h.includes("zara")) {
    return {
      label: "Zara",
      className: "bg-gray-900 text-white border-gray-700",
    };
  }

  if (h.includes("myntra")) {
    return {
      label: "Myntra",
      className: "bg-pink-100 text-pink-700 border-pink-200",
    };
  }

  if (h.includes("ajio")) {
    return {
      label: "AJIO",
      className: "bg-purple-100 text-purple-700 border-purple-200",
    };
  }

  const short = hostname.replace("www.", "").split(".")[0];
  return {
    label: short.charAt(0).toUpperCase() + short.slice(1),
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };
}
