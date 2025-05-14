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

  // update real sort when toggle is clicked
  const realSortToggle = document.getElementById("real-sort-toggle");
  realSortToggle.addEventListener("change", () => {
    const isRealSortEnabled = realSortToggle.checked;

    if (newestFilterToggle.checked == false) {
      // it makes sense to always have the "newest filter" enabled when "real sort" is enabled
      newestFilterToggle.checked = true;
      newestFilterToggle.dispatchEvent(new Event("change"));
    }

    chrome.storage.sync.set({ realSortEnabled: isRealSortEnabled }, () => {
      // TODO: make the alert fit the menu when it appears / cleaner

      // get tr element which contains a real-sort-toggle id element
      const toggleElem = document
        .querySelector("#real-sort-toggle")
        .closest("tr");
      let refreshAlertBanner = document.createElement("div");
      let trElem = document.createElement("tr");
      trElem.classList.add("tr-alert-banner");
      let tdElem = document.createElement("td");
      // colspan 2 to make it full width
      tdElem.setAttribute("colspan", "2");
      tdElem.classList.add("td-alert-banner");
      refreshAlertBanner.classList.add("refresh-alert-banner");
      refreshAlertBanner.style.backgroundColor = "orange";
      refreshAlertBanner.textContent =
        "Refresh the page to apply the sorting changes!";
      toggleElem.parentNode.insertBefore(
        refreshAlertBanner,
        toggleElem.nextSibling
      );
      // show this banner only 3 seconds
      setTimeout(() => {
        refreshAlertBanner.remove();
      }, 3000);
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
