document.addEventListener("DOMContentLoaded", () => {
  const newestFilterToggle = document.getElementById("newest-filter-toggle");

  // update filter when toggle is clicked
  newestFilterToggle.addEventListener("change", () => {
    const isFilterEnabled = newestFilterToggle.checked;

    chrome.storage.sync.set({ listenerEnabled: isFilterEnabled }, () => {
      chrome.runtime.sendMessage({
        command: "toggleListener",
        isFilterEnabled,
      });
    });
  });

  // set slider
  chrome.storage.sync.get("listenerEnabled", (data) => {
    const isFilteringEnabled = data.listenerEnabled;
    if (isFilteringEnabled == null) {
      // set default value if not found
      const listenerEnabledDefaultValue = true;
      chrome.storage.sync.set(
        { listenerEnabled: listenerEnabledDefaultValue },
        () => {
          // update slider
          newestFilterToggle.checked = listenerEnabledDefaultValue;
        }
      );
    } else {
      // update slider
      newestFilterToggle.checked = isFilteringEnabled;
    }
  });
});
