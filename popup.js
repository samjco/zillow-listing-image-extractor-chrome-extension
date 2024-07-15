document.addEventListener('DOMContentLoaded', function () {
    console.log('JSZip:', typeof JSZip); // This should log 'function' if JSZip is correctly loaded

// document.addEventListener('DOMContentLoaded', async () => {



    const navToZillowBtn = document.getElementById('navToZillow');
    const extractImgsBtn = document.getElementById('extractImgs');
    const navToImagesBtn = document.getElementById('navToImages');
    const messageDiv = document.getElementById('message');
    const imageUrlsDiv = document.getElementById('imageUrls');

    const addressInput = document.getElementById('address');
    const addressInput2 = document.getElementById('address2');
    const cityInput = document.getElementById('city');
    const stateInput = document.getElementById('state');
    const zipcodeInput = document.getElementById('zipcode');
    const goToAddressButton = document.getElementById('goToAddress');
    // const buttonGallery =  document.querySelector('button[data-cy="gallery-see-all-photos-button"]');



    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const url = new URL(currentTab.url);
        
        if (!url.hostname.includes('zillow.com')) {
            navToZillowBtn.classList.remove('hidden');
        } else {
            chrome.scripting.executeScript(
                {
                    target: { tabId: currentTab.id },
                    function: checkForListingPage
                },
                (results) => {
                    if (results && results[0] && results[0].result) {

                        extractImgsBtn.classList.remove('hidden');
                        messageDiv.classList.remove('hidden');
                        messageDiv.textContent = 'First, scroll down the gallery page to reveal all images before clicking Extract Images..';

                    } else {

                        chrome.scripting.executeScript(
                            {
                                target: { tabId: currentTab.id },
                                function: checkForCktieee
                            },
                            (results2) => {
                                if (results2 && results2[0] && results2[0].result) {
                                   
                                    navToImagesBtn.classList.remove('hidden');
                               
                               
                                } else {


                                    messageDiv.classList.remove('hidden');
                                    messageDiv.textContent = 'Simply navigate to a ACTIVE listing page of choice to see options';
                                }
                            }
                        );
                    }
                }
            );
        }
    });




    goToAddressButton.addEventListener('click', () => {
        const address = addressInput.value.trim().replace(/\s+/g, '-');
        const address2 = addressInput2.value.trim().replace(/\s+/g, '-');
        const city = cityInput.value.trim().replace(/\s+/g, '-');
        const state = stateInput.value;
        const zipcode = zipcodeInput.value.trim();
        
        if (!address2){

            if (!address || !city || !state || !zipcode) {
                alert('Please fill in all fields');
                return;
            }else{

                const urlString = `https://www.zillow.com/homes/${address}-${city}-${state}-${zipcode}_rb/`;
                chrome.tabs.create({ url:urlString });
                
            }
        }else{

            const urlString = `https://www.zillow.com/homes/${address2}_rb/`;
            chrome.tabs.create({ url:urlString });
        }


        chrome.tabs.create({ url:urlString });
    });

    navToImagesBtn.addEventListener('click', async () => {



        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                function: () => {
                const button = document.querySelector('button[data-cy="gallery-see-all-photos-button"]');
   

                if (button) {
                    button.click();


                } else {
                    console.error('Button not found');
                }
            }

            },


            
   
        );

        navToImagesBtn.classList.add('hidden');
        extractImgsBtn.classList.remove('hidden');
 

        messageDiv.classList.remove('hidden');
        messageDiv.textContent = 'First, scroll down the gallery page to reveal all images before clicking Extract Images..';


    });
    navToZillowBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.zillow.com' });
    });

    extractImgsBtn.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript(
            {
                target: { tabId: tab.id },
                function: extractImages
            },
            (results) => {
                if (results && results[0] && results[0].result) {
                    displayImageUrls(results[0].result);
                }
            }
        );

        extractImgsBtn.classList.add('hidden');
    });


    

    function forceDownload(link) {
        var url = link.getAttribute("data-href");
        var fileName = link.getAttribute("download");
        link.innerText = "Working...";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "blob";
        xhr.onload = function() {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            var tag = document.createElement('a');
            tag.href = imageUrl;
            tag.download = fileName;
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
            link.innerText = "Download Image";
        };
        xhr.send();
    }
    
    async function downloadAllImages(imageUrls) {
        if (typeof JSZip === 'undefined') {
            console.error('JSZip is not loaded');
            return;
        }
    
        const zip = new JSZip();
        const imgFolder = zip.folder("images");
    
        for (let i = 0; i < imageUrls.length; i++) {
            const url = imageUrls[i];
            const response = await fetch(url);
            const blob = await response.blob();
            const fileName = `Image-${i + 1}.jpg`;
            imgFolder.file(fileName, blob);
        }
    
        // zip.generateAsync({ type: "blob" }).then(function(content) {
        //     const link = document.createElement('a');
        //     link.href = URL.createObjectURL(content);
        //     // link.download = "images.zip";
        //     link.download = document.title + ".zip"; // Set the filename to the page title
        //     document.body.appendChild(link);
        //     link.click();
        //     document.body.removeChild(link);
        // });


  
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        func: () => document.title,
                    },
                    (results) => {
                        const pageTitle = results[0].result;
                        
                        // Assuming zip is already generated and available
                        zip.generateAsync({ type: "blob" }).then(function(content) {
                            const link = document.createElement('a');
                            link.href = URL.createObjectURL(content);
                           const SantpageTitle = pageTitle.replace(/\s+/g, '_');
                            link.download = "Property_images__" + SantpageTitle + ".zip"; // Set the filename to the page title
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        });
                    }
                );
            });












    }
    
    function displayImageUrls(imageUrls) {
        imageUrlsDiv.classList.remove('hidden');
        imageUrlsDiv.innerHTML = '<h3>Extracted Images:</h3>';
        const downloadAllButton = document.createElement('button');
        downloadAllButton.textContent = "Download All";
        downloadAllButton.classList.add('dlall');
        downloadAllButton.onclick = function() { downloadAllImages(imageUrls); };
        imageUrlsDiv.appendChild(downloadAllButton);
        imageUrls.forEach((url, index) => {
            const div = document.createElement('div');
            div.classList.add('image-container');
            const img = document.createElement('img');
            img.src = url;
            const downloadLink = document.createElement('a');
            downloadLink.href = '#';
            downloadLink.setAttribute('data-href', url);
            downloadLink.setAttribute('download', `Image-${index + 1}.jpg`);
            downloadLink.classList.add('download-link');
            downloadLink.textContent = 'Download';
            downloadLink.onclick = function(event) {
                event.preventDefault(); // Prevent default action
                forceDownload(downloadLink);
            };
            div.appendChild(img);
            div.appendChild(downloadLink);
            imageUrlsDiv.appendChild(div);
        });
    }  
       
    
});

function checkForListingPage() {
    return !!document.querySelector('section#viw-modal');
}
function checkForCktieee() {
    // return !!document.querySelector('span.cktiee');
    return !!document.querySelector('button[data-cy="gallery-see-all-photos-button"]');
}
function checkForIxkFNb() {
    return !!document.querySelector('span.ixkFNb');
}

function extractImages() {
    const container = document.querySelector('section#viw-modal ul');
    const imageUrls = [];
    if (container) {
        const images = container.querySelectorAll('li picture > img');
        images.forEach(img => {
            if (img.src) {
                imageUrls.push(img.src);
            }
        });
    }
    return imageUrls;
// }
};
