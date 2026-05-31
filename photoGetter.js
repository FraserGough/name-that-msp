async function getMspData(dataset,format) {
  const url = `https://data.parliament.scot/api/members/json`;
  try {
    const response = await fetch(url);
    const data = await response.text();
    return data;
  } catch (err) {
    console.error("Failed to fetch data",err);
    return null;
  };
}


async function createDlLinks() {
  const mspsData = await getMspData();
  const mspsAll = JSON.parse(mspsData);
  const msps = mspsAll.filter(msp => msp.IsCurrent === true);
  const outputArea = document.getElementById("linksContainer");
  for (const msp of msps) {
    const dlBlock = document.createElement("div");
    dlBlock.classList.add("w3-container","w3-bar","w3-border-bottom");
    const urlBlock = document.createElement("p");
    const urlTxt = document.createTextNode(msp.PhotoURL);
    urlBlock.appendChild(urlTxt);
    dlBlock.appendChild(urlBlock);
    const fNameBlock = document.createElement("p");
    const fNameTxt = document.createTextNode(getFileName(msp.PhotoURL));
    fNameBlock.appendChild(fNameTxt);
    dlBlock.appendChild(fNameBlock);
    const maybeHref = await getBlob(msp.PhotoURL);
    if (maybeHref === "") {
      dlBlock.classList.add("w3-red");
    } else {
      const dlLink = document.createElement("a");
      dlLink.href = maybeHref;
      dlLink.setAttribute("download",fNameBlock.textContent);
      const dlLinkTxt = document.createTextNode("click to download");
      dlLink.appendChild(dlLinkTxt);
      dlBlock.appendChild(dlLink);
    };
    outputArea.appendChild(dlBlock);
  };
}

async function getBlob(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.log(`download failed: ${error}`);
    return "";
  };

}

function getFileName(url) {
  const urlArray = url.split("/");
  return urlArray[urlArray.length - 1];
}

createDlLinks();
