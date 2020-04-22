/**
 * Este código está desatualizado, aconselho utilizar o amazonEbookTaker2.0.js,
 * caso deseje você poderá utilizar a função fetchAllPurchaseLinks deste script,
 * mas saiba que seu script irá demorar muito mais requisitar todos os links.
 */

let pageNumber = 1;

const pagesAccessed = [];
const pagesThatFailed = [];

let allNormalLinks = [];

const purchaseLinksThatWorked = [];
const failedPurchaseLinks = [];

const pagesToBeAccessedIndividually = [];

document.getElementsByTagName('body')[0].innerHTML = '<div id="content"></div>';
const contentDiv = document.getElementById('content');

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
  contentDiv.innerHTML = html.substr(
    html.indexOf('<body>') + 6,
    html.indexOf('</body>')
  );
}

function getAllNormalLinksInPage() {
  allNormalLinks = document.querySelectorAll(
    'h2 a.a-link-normal.a-text-normal'
  );
}

async function fetchAllPurchaseLinks() {
  const buttonLinks = document.querySelectorAll('a[href^="/gp/product/"]');

  for (let index = 0; index < buttonLinks.length; index++) {
    const element = buttonLinks[index];

    await fetch(element.href)
      .then((response) => {
        console.log('Success:', response);
        purchaseLinksThatWorked.push(element.href);
      })
      .catch((error) => {
        console.error('Error:', error);
        console.log(`Request failed: ${element.href}`);
        failedPurchaseLinks.push(element.href);
      });
  }
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

      if (!includesAsin) {
        pagesToBeAccessedIndividually.push(element.href);
      }
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
  pagesThatFailed.push(pageId);
  console.error('Error:', error);
}
