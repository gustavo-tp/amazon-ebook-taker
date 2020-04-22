let pageNumber = parseInt(localStorage.getItem('currentPageNumber')) || 1;

const pagesAccessed = localStorage.getItem('pagesAccessed')
  ? localStorage.getItem('pagesAccessed').split(',')
  : [];
const pagesThatFailed = localStorage.getItem('pagesThatFailed')
  ? localStorage.getItem('pagesThatFailed').split(',')
  : [];

let allNormalLinks = [];

let purchaseLinksThatWorked = [];
let failedPurchaseLinks = [];

const pagesToBeAccessedIndividually = localStorage.getItem(
  'pagesToBeAccessedIndividually'
)
  ? localStorage.getItem('pagesToBeAccessedIndividually').split(',')
  : [];

document.getElementsByTagName('body')[0].innerHTML = '<div id="content"></div>';
const contentDiv = document.getElementById('content');

NodeList.prototype.map = Array.prototype.map;

function getPurchaseLinks() {
  fetch(
    `https://www.amazon.com.br/eBooks-Gratuitos-Gr%C3%A1tis-Loja-Kindle/s?rh=n%3A6311441011%2Cp_36%3A5560478011&page=${pageNumber}`
  )
    .then(handlePageReturnedSuccessfully)
    .then(includePageHtmlInDocument)
    .then(getAllNormalLinksInPage)
    .then(fetchAllPurchaseLinks)
    .then(checkPagesThatMustBeAccessedIndividually)
    .then(storeLogsInLocalStorage)
    .then(callGetPurchaseLinksInNextPage)
    .catch(handlePageReturnedWithError);
}

function handlePageReturnedSuccessfully(response) {
  pagesAccessed.push(pageNumber);
  return response.text();
}

function includePageHtmlInDocument(html) {
  let subHtml = html.substr(html.indexOf('<body'));

  subHtml = subHtml.substr(subHtml.indexOf('>') + 1);
  subHtml = subHtml.substr(0, subHtml.indexOf('</body>'));

  contentDiv.innerHTML = subHtml;
}

function getAllNormalLinksInPage() {
  allNormalLinks = document.querySelectorAll(
    'h2 a.a-link-normal.a-text-normal'
  );
}

function fetchLink(link) {
  purchaseLinksThatWorked = [];
  failedPurchaseLinks = [];

  return new Promise((resolve, reject) => {
    fetch(link.href)
      .then((response) => {
        purchaseLinksThatWorked.push(link.href);
        console.log('Successful request for: ', link.href);
        resolve(`Successful request for: ${link.href}`);
      })
      .catch((error) => {
        failedPurchaseLinks.push(link.href);
        console.log('Unsuccessful request for: ', link.href);
        reject(`Unsuccessful request for: ${link.href}`);
      });
  });
}

async function fetchAllPurchaseLinks() {
  const buttonLinks = document.querySelectorAll('a[href^="/gp/product/"]');

  await Promise.allSettled(buttonLinks.map((link) => fetchLink(link)))
    .then((response) => console.log(response));
}

function checkPagesThatMustBeAccessedIndividually() {
  for (let index = 0; index < allNormalLinks.length; index++) {
    const element = allNormalLinks[index];

    const asin = element.href.split('/')[5];
    let includesAsin = false;

    for (let i = 0; i < purchaseLinksThatWorked.length; i++) {
      const link = purchaseLinksThatWorked[i];
      const queryParans = link.split('/')[7];

      if (queryParans.includes(asin)) {
        includesAsin = true;
        break;
      }
    }

    if (!includesAsin) {
      pagesToBeAccessedIndividually.push(element.href);
    }
  }
}

function storeLogsInLocalStorage() {
  localStorage.setItem('currentPageNumber', pageNumber);
  localStorage.setItem('pagesAccessed', pagesAccessed);
  localStorage.setItem('pagesThatFailed', pagesThatFailed);
  localStorage.setItem('purchaseLinksThatWorked', purchaseLinksThatWorked);
  localStorage.setItem('failedPurchaseLinks', failedPurchaseLinks);
  localStorage.setItem(
    'pagesToBeAccessedIndividually',
    pagesToBeAccessedIndividually
  );
}

function callGetPurchaseLinksInNextPage() {
  if (++pageNumber < 401) {
    getPurchaseLinks();
  }
}

function handlePageReturnedWithError(error) {
  pagesThatFailed.push(pageNumber);
  console.error('Error:', error);
}
