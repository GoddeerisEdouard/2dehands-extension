// this script can even run when the view is "Foto's" (which it isn't intended to do), because the view filter isn't always updated in the URL, so we also validate by checking the active view button
let isListView = true;
if (!location.href.includes("|view:list-view")) {
  // no view filter in URL, so we check the active view button
  let viewElemText = document
    .querySelector("button.isActive")
    .getAttribute("aria-label")
    .trim();
  isListView = viewElemText === "Lijst";
}
// TODO: when we swap from "Foto's" to "Lijst" with the frontend, the listings aren't updated
if (isListView) {
  const ul = document.querySelector(".hz-Listings");

  // make sure to dynamically set the listings back to white when they are removed from the blaclist
  chrome.runtime.onMessage.addListener((message) => {
    if (message.command === "removeFromBlacklist") {
      const receivedSellerName = message.sellerName;

      // Select all the listings that might have been marked red due to this seller
      const listings = ul.querySelectorAll("li.hz-Listing");
      for (let li of listings) {
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
          // Reset the background color to white
          li.style.backgroundColor = "white";
        }
      }
    }
  });

  // TODO: if reordering the page is disabled, we shouldn't have to get all the IDs and everything should go much faster
  async function initializeListingsByMenuSettings() {
    // if actual order is enabled, add banner with notification
    // TODO: make this toggleable
    chrome.storage.sync.get("realSortEnabled", (data) => {
      const realSortToggleEnabled = data.realSortEnabled;
      if (realSortToggleEnabled) {
        const banner = document.createElement("div");
        banner.classList.add("reordering-banner");
        banner.style.backgroundColor = "orange";
        banner.textContent =
          "⌛ Actually reordering... (can take up to 5 secs)";
        ul.insertBefore(banner, ul.firstChild);
      }
    });

    let listings = ul.querySelectorAll("li.hz-Listing");

    let listingsIdMap = new Map();

    let invisibleListingsCounter = 0;
    for (let li of listings) {
      if (li.offsetParent === null) {
        invisibleListingsCounter += 1;
        continue; // Skip if the listing is not visible
      }

      // we add a blacklist button to the listing
      addBlackListSellerButton(li);

      // check if ad, if so, color it red
      if (await isAd(li)) {
        li.style.backgroundColor = "red";
      } else if (li.style.backgroundColor === "red") {
        li.style.backgroundColor = "white";
      }

      // get ID from href
      const anchor = li.querySelector("div > div > a");
      if (!anchor.href) {
        anchor.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        // wait for hover effect to load href if it's dynamic
        await new Promise((r) => setTimeout(r, 200));
        if (!anchor.href) {
          console.warn(
            `Still no href found!\nOrdering won't work if not all listings have an ID!`
          );
        }
      }

      // TODO: verify that every ID starts with "/m" or "/a"
      // because if some start with m while other with a, the ordering won't work correctly
      const match = anchor.href.match(/\/[ma](\d+)-/);
      listingsIdMap.set(match[1], li); // Add the ID to the Set
    }

    // resort listings if enabled...
    chrome.storage.sync.get("realSortEnabled", (data) => {
      const realSortToggleEnabled = data.realSortEnabled;
      if (realSortToggleEnabled) {
        // order by ID (oldest listing first)
        orderedListings = new Map(
          [...listingsIdMap].sort((a, b) => String(a[0]).localeCompare(b[0]))
        );
        orderedListings.values().forEach((li) => {
          // insert it right after the "ordering" banner
          ul.insertBefore(li, ul.firstChild.nextSibling);
        });

        // DONE message in banner
        let reorderingBanner = ul.querySelector(".reordering-banner");
        if (reorderingBanner != null) {
          reorderingBanner.textContent = "✅ DONE reordering!";
          reorderingBanner.style.backgroundColor = "greenyellow";
          // wait 3 secs before removing the banner
          setTimeout(() => {
            reorderingBanner.remove();
          }, 3000);
        }
      }
    });
  }

  // INDIVUAL LISTING METHODS
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
      const listings = ul.querySelectorAll("li.hz-Listing");
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

  async function isAd(listingElem) {
    return (
      isTopAdvertentie(listingElem) || (await isSellerBlacklisted(listingElem))
    );
  }

  function isTopAdvertentie(listingElement) {
    const topAdvertentieText = listingElement.querySelector(
      ".hz-Listing-priority.hz-Listing-priority--all-devices"
    ).textContent;

    return topAdvertentieText == "Topzoekertje";
  }

  async function isSellerBlacklisted(listingElem) {
    let sellerInfoElem = listingElem.querySelector(".hz-Listing--sellerInfo");
    const sellerName = sellerInfoElem.querySelector(
      ".hz-Listing-seller-name"
    ).textContent;

    const res = new Promise(function (resolve, _) {
      chrome.storage.sync.get({ blacklistedSellers: [] }, function (result) {
        resolve(result.blacklistedSellers);
      });
    });
    const bls = await res;

    return bls.indexOf(sellerName) !== -1;
  }

  // we wait a second before initializing, because an adblocker & the website might still be dynamically editing elements
  setTimeout(() => {
    initializeListingsByMenuSettings();
  }, 1000); // TODO: on slower loading, this might even be too soon
}
