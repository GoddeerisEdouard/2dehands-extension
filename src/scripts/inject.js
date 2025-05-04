// this resorts the listings by index (itemId) and returns a modified response, which the frontend will use
(function () {
  console.log("🚀 inject.js running inside page context");

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    const url = args[0];

    if (typeof url !== "string" || !url.includes("/lrp/api/search")) {
      return response; // Not the API call we're looking for
    }

    const cloned = response.clone();
    try {
      const json = await cloned.json();

      if (Array.isArray(json.listings)) {
        json.listings.sort((a, b) => {
          const numA = parseInt(a.itemId.slice(1), 10);
          const numB = parseInt(b.itemId.slice(1), 10);
          return numB - numA; // highest number first
        });
      }

      const blob = new Blob([JSON.stringify(json)], {
        type: "application/json",
      });
      const newResponse = new Response(blob, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      return newResponse;
    } catch (err) {
      console.error("Error parsing or modifying response:", err);
      return response;
    }
  };
})();
