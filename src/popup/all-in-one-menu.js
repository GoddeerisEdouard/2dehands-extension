document.addEventListener("DOMContentLoaded", () => {
  function showMessageBanner(message, timeoutInSeconds = 3) {
    const toggleElem = document
      .querySelector("#real-sort-toggle")
      .closest("tr");

    let refreshAlertBanner = document.createElement("tr");
    refreshAlertBanner.classList.add("refresh-alert-banner");
    let tdElem = document.createElement("td");
    // colspan 2 to make it full width
    tdElem.setAttribute("colspan", "2");
    refreshAlertBanner.appendChild(tdElem);

    tdElem.style.backgroundColor = "orange";
    tdElem.textContent = message;
    toggleElem.parentNode.insertBefore(
      refreshAlertBanner,
      toggleElem.nextSibling
    );

    // fade out then remove
    setTimeout(() => {
      // start fade out
      refreshAlertBanner.style.opacity = 0;

      // listen for the end of the transition, then remove element
      refreshAlertBanner.addEventListener(
        "transitionend",
        () => {
          refreshAlertBanner.remove();
        },
        { once: true }
      );
    }, 1000 * timeoutInSeconds);
  }
  const newestFilterToggle = document.getElementById("newest-filter-toggle");

  // update filter when toggle is clicked
  newestFilterToggle.addEventListener("change", () => {
    const isFilterEnabled = newestFilterToggle.checked;

    if (!isFilterEnabled && realSortToggle.checked) {
      // it makes sense to always have the "real sort" disabled when "newest filter" is disabled
      realSortToggle.checked = false;
      realSortToggle.dispatchEvent(new Event("change"));
      showMessageBanner(
        "ℹ️ 'Actually Sort Listings' is OFF when 'Auto Newest Filter' is OFF 🔴",
        5
      );
    }

    chrome.storage.sync.set({ listenerEnabled: isFilterEnabled }, () => {
      chrome.runtime.sendMessage({
        command: "toggleListener",
        isFilterEnabled,
      });
    });
  });

  // update real sort when toggle is clicked
  const realSortToggle = document.getElementById("real-sort-toggle");
  realSortToggle.addEventListener("change", () => {
    const isRealSortEnabled = realSortToggle.checked;

    if (isRealSortEnabled && !newestFilterToggle.checked) {
      // it makes sense to always have the "newest filter" enabled when "real sort" is enabled
      newestFilterToggle.checked = true;
      newestFilterToggle.dispatchEvent(new Event("change"));
      showMessageBanner(
        "ℹ️ 'Auto Newest Filter' is ON when 'Actually Sort Listings' is ON 🟢",
        5
      );
    }

    chrome.storage.sync.set({ realSortEnabled: isRealSortEnabled }, () => {
      // TODO: make the alert fit the menu when it appears / cleaner

      // get tr element which contains a real-sort-toggle id element
      showMessageBanner("🔄 Refresh the page to apply the sorting changes!", 3);
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
        // make background of listing white again if it was red on 2dehands
        // we're only sending the message to tabs that have the listener to handle these messages
        chrome.tabs.query(
          {
            url: ["https://www.2dehands.be/q/*", "https://www.2dehands.be/l/*"],
          },
          function (tabs) {
            for (let tab of tabs) {
              console.log("sending message to tab", tab.id);
              chrome.tabs.sendMessage(tab.id, {
                command: "removeFromBlacklist",
                sellerName: sellerName,
              });
            }
          }
        );

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

  // set filter toggle
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

  // set real order toggle
  chrome.storage.sync.get("realSortEnabled", (data) => {
    const isRealOrderEnabled = data.realSortEnabled;
    if (isRealOrderEnabled == null) {
      // set default value if not found
      const realSortEnabledDefaultValue = false;
      chrome.storage.sync.set(
        { realSortEnabled: realSortEnabledDefaultValue },
        () => {
          // update slider
          realSortToggle.checked = realSortEnabledDefaultValue;
        }
      );
    } else {
      // update slider
      realSortToggle.checked = isRealOrderEnabled;
    }
  });
});
