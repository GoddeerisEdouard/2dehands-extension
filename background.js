const listener = function (details) {
  const url = new URL(details.url);
  if (!url.hash.includes("sortOrder:DECREASING")) {
    url.hash =
      "#Language:all-languages|sortBy:SORT_INDEX|sortOrder:DECREASING|searchInTitleAndDescription:true";
    return { redirectUrl: url.href };
  }
};

const filter = { urls: ["*://www.2dehands.be/q/*"] };
const extraInfoSpec = ["blocking"];

function updateListener(enabled) {
  // adds/removes the filter redirect
  if (enabled) {
    chrome.webRequest.onBeforeRequest.addListener(
      listener,
      filter,
      extraInfoSpec
    );
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


