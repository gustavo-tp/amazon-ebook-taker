const links = localStorage.getItem('pagesToBeAccessedIndividually').split(',');

let linkIndex = parseInt(localStorage.getItem('currentLinkIndex')) || 0;

const individuallyPagesAccessed = localStorage.getItem(
  'individuallyPagesAccessed'
)
  ? localStorage.getItem('individuallyPagesAccessed').split(',')
  : [];
const individuallyPagesThatFailed = localStorage.getItem(
  'individuallyPagesThatFailed'
)
  ? localStorage.getItem('individuallyPagesThatFailed').split(',')
  : [];

const purchaseFormsThatWorked = localStorage.getItem('purchaseFormsThatWorked')
  ? localStorage.getItem('purchaseFormsThatWorked').split(',')
  : [];
const failedPurchaseForms = localStorage.getItem('failedPurchaseForms')
  ? localStorage.getItem('failedPurchaseForms').split(',')
  : [];

document.getElementsByTagName('body')[0].innerHTML = '<div id="content"></div>';
const contentDiv = document.getElementById('content');

function getPurchaseLinks() {
  fetch(links[linkIndex])
    .then(handlePageReturnedSuccessfully)
    .then(includePageHtmlInDocument)
    .then(fetchForm)
    .then(storeLogsInLocalStorage)
    .then(callGetPurchaseLinksInNextPage)
    .catch(handlePageReturnedWithError);
}

function handlePageReturnedSuccessfully(response) {
  individuallyPagesAccessed.push(links[linkIndex]);
  return response.text();
}

function includePageHtmlInDocument(html) {
  const init = html.indexOf('<form method="post" id="buyOneClick"');
  const subs = html.substr(init);
  contentDiv.innerHTML = subs.substr(0, subs.indexOf('</form>') + 7);
}

async function fetchForm() {
  const form = document.getElementById('buyOneClick');
  const formData = new FormData(form);

  if (formData.get('displayedPrice') !== '0.0') {
    failedPurchaseForms.push(links[linkIndex]);
    console.log('E-book for: ', links[linkIndex], ' is not free');
    return;
  }

  await fetch(form.action, {
    method: 'POST',
    body: formData,
  })
    .then(result => {
      if (result.status === 200) {
        console.log('Success:', result);
        purchaseFormsThatWorked.push(links[linkIndex]);
      } else {
        console.log(`Request failed: ${links[linkIndex]}`);
        failedPurchaseForms.push(links[linkIndex]);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      console.log(`Request failed: ${links[linkIndex]}`);
      failedPurchaseForms.push(links[linkIndex]);
    });
}

function storeLogsInLocalStorage() {
  localStorage.setItem('currentLinkIndex', linkIndex);
  localStorage.setItem('individuallyPagesAccessed', individuallyPagesAccessed);
  localStorage.setItem(
    'individuallyPagesThatFailed',
    individuallyPagesThatFailed
  );
  localStorage.setItem('purchaseFormsThatWorked', purchaseFormsThatWorked);
  localStorage.setItem('failedPurchaseForms', failedPurchaseForms);
}

function callGetPurchaseLinksInNextPage() {
  if (linkIndex++ < links.length) {
    getPurchaseLinks();
  }
}

function handlePageReturnedWithError(error) {
  individuallyPagesThatFailed.push(linkIndex);
  console.error('Error:', error);
}
