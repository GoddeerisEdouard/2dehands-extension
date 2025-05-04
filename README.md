# 2dehands-extension
Extension for [2dehands](www.2dehands.be) which makes it easier to browse listings.  
![](./assets/images/2dehands-extension-menu.png)


- [x] toggle auto order by new-old
    > sometimes, when browsing multiple listings for a while, you have to reselect the "sort by" option to sort by "new-old".  
    > This toggle ensures that whenever you press Enter to query a listing, the sort option is applied.
- [x] actually sort listings
    > 2dehands tends to put ad/paid listings first. This toggle ensures that the actually latest listings get put first.
- [x] filters out [Ad listings](#Ad-listing) and [blacklisted sellers](#blacklist)
    > these are colored in either RED or PINK


## Installation
Download as zip.  
extract zip.  
go to `chrome://extensions/` and make sure developer mode is enabled.  
load extracted extension and select the folder.

## In Development
nothing

## Extra Info
### Ad Listing
Ad listings consist of:
> - "Topzoekertje" marking on bottom right (PINK)
>> annoying listings that get promoted to stay on top, which makes you miss out on good deals by "normal" sellers.
> - "Bezoek website" on the bottom right OR multiple images on the frontpage (RED)
>> webshops that are usually just promoting their "new" products

**promoted listing before extension**
![](./assets/images/beforeAdExample.png)
**promoted listing after extension (PINK)**
![topzoekertje example](./assets/images/afterAdExample.png)
**webshop listing after extension (RED)**
![webshop bezoek website example](./assets/images/webshopExample.png)
![webshop multiple images example](./assets/images/webshopMultipleImagesExample.png)


### blacklist
some sellers are just reposting and spamming the first pages of a query. Hence this blacklist feature.  

You can blacklist that seller with a "blacklist seller" button. Once clicked, all listings of this seller will be colored in RED.
![](./assets/images/blacklistSellerBtnExample.png)
you can whitelist them again by removing the seller in the All-in-One Menu.  
![](./assets/images/blacklistedListMenuExample.png)
