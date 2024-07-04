async function removeListings() {
  let viewListing = document.getElementsByClassName(
    "hz-Listings hz-Listings--list-view"
  )[0];

  let allListings = Array.from(
    viewListing.getElementsByClassName("hz-Listing")
  );

  for (const listing of allListings) {
    addBlackListSellerButton(listing);

    if (await isAd(listing)) {
      listing.style.backgroundColor = "red";
    } else if (listing.style.backgroundColor === "red") {
      listing.style.backgroundColor = "white";
    }
  }
}

// HELPER METHODS

function addBlackListSellerButton(listingElem) {
  let sellerInfoElem = listingElem.getElementsByClassName(
    "hz-Listing--sellerInfo"
  )[0];

  if (
    sellerInfoElem.getElementsByClassName("seller-blacklist-container")[0] !=
    null
  ) {
    return;
  }

  // create new btn part
  let blacklistSellerSpan = document.createElement("span");
  blacklistSellerSpan.className = "seller-blacklist-container";

  let submitBlacklistLinkElem = document.createElement("input");
  submitBlacklistLinkElem.value = "blacklist seller";
  submitBlacklistLinkElem.type = "submit";

  submitBlacklistLinkElem.onclick = () => {
    let sellerName = sellerInfoElem.getElementsByClassName(
      "hz-Listing-seller-name"
    )[0].textContent;
    // append blacklisted seller
    chrome.storage.sync.get("blacklistedSellers", (result) => {
      let blacklistedSellers = result.blacklistedSellers || [];

      // prevent duplicates
      if (blacklistedSellers.indexOf(sellerName) !== -1) {
        return;
      }

      blacklistedSellers.push(sellerName);
      chrome.storage.sync.set({ blacklistedSellers: blacklistedSellers });
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

// helper methods to filter
async function isAd(listingElem) {
  return (
    isTopAdvertentie(listingElem) || (await isSellerBlacklisted(listingElem))
  );
}

// helper method
function getAllListingInfo() {
  let allListings = viewListing.getElementsByClassName("hz-Listing");
  allListings.forEach((listing, index) => {
    console.log(
      `i: ${index}\ntitle: ${getTitleOfListing(
        listing
      )}\nisTopAdvertentie: ${isTopAdvertentie(listing)}`
    );
  });
}

// helper methods for given elem
function getTitleOfListing(listingElem) {
  let title =
    listingElem.getElementsByClassName("hz-Listing-title")[0].textContent;
  return title;
}

function isTopAdvertentie(listingElement) {
  const topAdvertentieText = listingElement.getElementsByClassName(
    "hz-Listing-priority hz-Listing-priority--all-devices"
  )[0].textContent;

  return topAdvertentieText == "Topzoekertje";
}

async function isSellerBlacklisted(listingElem) {
  let sellerInfoElem = listingElem.getElementsByClassName(
    "hz-Listing--sellerInfo"
  )[0];
  const sellerName = sellerInfoElem.getElementsByClassName(
    "hz-Listing-seller-name"
  )[0].textContent;

  const res = new Promise(function (resolve, _) {
    chrome.storage.sync.get({ blacklistedSellers: true }, function (result) {
      resolve(result.blacklistedSellers);
    });
  });
  const bls = await res;

  return bls.indexOf(sellerName) !== -1;
}

setInterval(removeListings, 500);
