(() => {
  // if sort enabled, inject response modifier script
  chrome.storage.sync.get("realSortEnabled", (data) => {
    const realSortToggleEnabled = data.realSortEnabled;
    if (realSortToggleEnabled) {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("src/scripts/inject.js");
      script.onload = function () {
        this.remove(); // Clean up after loading
      };

      (document.head || document.documentElement).appendChild(script);
      console.log("Injected fetch interceptor into page context.");
    }
  });
})();
