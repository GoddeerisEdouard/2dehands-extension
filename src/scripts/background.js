// This file changes the browser URL to always include a sorting order, if enabled in the menu

const listener = function (details) {
  let url = new URL(details.url);
  if (url.hash.includes("sortBy:SORT_INDEX|sortOrder:DECREASING")) {
    // if the URL already includes a sorting order, we don't need to do anything
    return;
  }

  if (url.hash.length === 0) {
    url.hash = "sortBy:SORT_INDEX|sortOrder:DECREASING";
  } else {
    url.hash += "|sortBy:SORT_INDEX|sortOrder:DECREASING";
  }
  return { redirectUrl: url.href };
};

const filter = {
  urls: ["https://www.2dehands.be/q/*", "https://www.2dehands.be/l/*"],
};

function updateListener(enabled) {
  // adds/removes the filter redirect
  if (enabled) {
    chrome.webRequest.onBeforeRequest.addListener(listener, filter, [
      "blocking",
    ]);
  } else {
    chrome.webRequest.onBeforeRequest.removeListener(listener);
  }
}

// Initialize the listener state based on storage
chrome.storage.sync.get("listenerEnabled", (data) => {
  const enabled = data.listenerEnabled;
  updateListener(enabled);
});

// Listen for messages to toggle the listener
chrome.runtime.onMessage.addListener((message) => {
  if (message.command === "toggleListener") {
    updateListener(message.isFilterEnabled);
  }
});
