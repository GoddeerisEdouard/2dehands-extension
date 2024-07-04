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

  // set blacklisted sellers list

  chrome.storage.sync.get("blacklistedSellers", (res) => {
    let bls = res.blacklistedSellers || [];
    const blacklistedSellerUl = document.getElementsByClassName(
      "blacklisted sellers"
    )[0];
    // creates a new element for every seller
    bls.forEach((sellerName) => {
      const newBlacklistedSellerElem = document.createElement("li");
      newBlacklistedSellerElem.textContent = sellerName;
      const removeBtn = document.createElement("button");
      removeBtn.onclick = () => {
        // remove seller by name
        chrome.storage.sync.get("blacklistedSellers", (result) => {
          let blacklistedSellers = result.blacklistedSellers;
          const sellerIndex = blacklistedSellers.indexOf(sellerName);
          if (sellerIndex !== -1) {
            blacklistedSellers.splice(sellerIndex, 1);
          }

          chrome.storage.sync.set({ blacklistedSellers: blacklistedSellers });
          blacklistedSellerUl.removeChild(newBlacklistedSellerElem);
        });
      };
      // add bin icon on button
      const removeIcon = document.createElement("i");
      removeIcon.className = "material-icons";
      removeIcon.textContent = "delete";
      removeBtn.appendChild(removeIcon);

      newBlacklistedSellerElem.appendChild(removeBtn);
      blacklistedSellerUl.appendChild(newBlacklistedSellerElem);
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
