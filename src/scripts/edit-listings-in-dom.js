// INDIVUAL LISTING METHOD
function addBlackListSellerButton(listingElem) {
  // adds inplace blacklist button to the listing element
  let sellerInfoElem = listingElem.querySelector(".hz-Listing--sellerInfo");

  // don't add the button if it already exists
  if (sellerInfoElem.querySelector(".seller-blacklist-container") != null) {
    return;
  }

  // create new btn part
  let blacklistSellerSpan = document.createElement("span");
  blacklistSellerSpan.className = "seller-blacklist-container";

  let submitBlacklistLinkElem = document.createElement("input");
  submitBlacklistLinkElem.value = "blacklist seller";
  submitBlacklistLinkElem.type = "submit";

  submitBlacklistLinkElem.onclick = () => {
    let sellerName = sellerInfoElem.querySelector(
      ".hz-Listing-seller-name"
    ).textContent;
    if (!sellerName) return;

    // color all listings in ul with that seller name red
    const listings = document.querySelectorAll("li.hz-Listing");
    for (let li of listings) {
      if (li.offsetParent === null) {
        continue; // Skip if the listing is not visible
      }
      let currentListingSellerName = li.querySelector(
        ".hz-Listing-seller-name"
      )?.textContent;
      if (
        currentListingSellerName &&
        currentListingSellerName === sellerName &&
        li.style.backgroundColor != "red"
      ) {
        // could already be red because of it being an ad
        // set background color to red
        li.style.backgroundColor = "red";
      }
    }
    // append blacklisted seller
    chrome.storage.sync.get("blacklistedSellers", (result) => {
      let blacklistedSellers = result.blacklistedSellers || [];

      // prevent duplicates
      if (!blacklistedSellers.includes(sellerName)) {
        chrome.storage.sync.set({
          blacklistedSellers: [...blacklistedSellers, sellerName],
        });
      }
    });
  };

  // add submit btn to span container
  blacklistSellerSpan.appendChild(submitBlacklistLinkElem);

  // append after seller location info
  sellerInfoElem.insertBefore(
    blacklistSellerSpan,
    sellerInfoElem.childNodes[2]
  );
}

function highlightPriorityListingOrShopListingAndAddButton() {
  // highlighting means either coloring pink or red
  let allListings = document.querySelectorAll(
    "li.hz-Listing.hz-Listing--list-item"
  );

  for (let listing of allListings) {
    if (listing.offsetParent === null) continue; // Skip if the listing is not visible

    // we add a blacklist button to the listing
    addBlackListSellerButton(listing);

    if (listing.style.backgroundColor !== "") {
      continue; // Skip if already colored
    }

    // if listing is ad, color pink
    if (listing.querySelector("span.hz-Listing-priority").textContent !== " ") {
      listing.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    } else if (
      listing.querySelector("span.hz-Listing-seller-link").hasChildNodes()
    ) {
      // if listing is sold by a Shop, color red (because it's an ad)
      listing.style.backgroundColor = "red";
    } else {
      // check if seller is blacklisted
      chrome.storage.sync.get("blacklistedSellers", (result) => {
        let blacklistedSellers = result.blacklistedSellers || [];

        // check if the seller is blacklisted
        let sellerName = listing.querySelector(
          ".hz-Listing-seller-name"
        )?.textContent;

        // if the seller is blacklisted, color red too
        if (blacklistedSellers.includes(sellerName)) {
          listing.style.backgroundColor = "red";
        }
      });
    }
  }
}

// Observe changes to the DOM in case the element appears later
const observer = new MutationObserver(() => {
  highlightPriorityListingOrShopListingAndAddButton();
});

// Start observing the document body
observer.observe(document.body, { childList: true, subtree: true });

(() => {
  let isListView = true;
  if (!location.href.includes("|view:list-view")) {
    // no view filter in URL, so we check the active view button
    let viewElemText = document
      .querySelector("button.isActive")
      .getAttribute("aria-label")
      .trim();
    isListView = viewElemText === "Lijst";
  }
  // if the view is "Foto's", we don't want to add the blacklist buttons nor possibly resort
  if (!isListView) return;

  // listen for blacklist removal & dynamically update DOM
  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === "removeFromBlacklist") {
      const receivedSellerName = message.sellerName;

      // Select all the listings that might have been marked red due to this seller
      for (let li of document.querySelectorAll("li.hz-Listing")) {
        if (li.offsetParent === null || li.style.backgroundColor == "white") {
          continue; // Skip if the listing is invisible or already white
        }

        let currentListingSellerName = li.querySelector(
          ".hz-Listing-seller-name"
        )?.textContent;
        if (
          currentListingSellerName &&
          currentListingSellerName === receivedSellerName
        ) {
          // if it's an ad, reset to pink
          if (
            li.querySelector("span.hz-Listing-priority").textContent !== " "
          ) {
            li.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
          } else {
            // Reset the background color to white
            li.style.backgroundColor = "white";
          }
        }
      }
    }
  });

  // Run once initially in case elements are already there
  highlightPriorityListingOrShopListingAndAddButton();
})();
