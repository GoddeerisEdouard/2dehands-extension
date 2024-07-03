function removeAdListings() {
  let viewListing = document.getElementsByClassName(
    "hz-Listings hz-Listings--list-view"
  )[0];

  let allListings = Array.from(
    viewListing.getElementsByClassName("hz-Listing")
  );

  allListings.forEach((listing) => {
    if (isAd(listing)) {
      listing.style.backgroundColor = "red";
    }
  });
}

// helper method to filter
function isAd(listingElem) {
  return isTopAdvertentie(listingElem);
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

// Controleer elke 500 milliseconden of het element is geladen
const intervalId = setInterval(removeAdListings, 500);
