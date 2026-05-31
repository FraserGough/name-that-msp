let gMsps = [];

import {buildDeck} from "./ui.js";

async function getParliamentOpenData(dataset,format) {
  const url = `https://data.parliament.scot/api/${dataset}/${format}`;
  try {
    const response = await fetch(url);
    const data = await response.text();
    return data;
  } catch (err) {
    console.error("Failed to fetch data",err);
    dataFailureUpdate(dataset);
    return null;
  };
}

function dataFailureUpdate(dataset) {
  const processName = document.getElementById("processName");
  const failMsg = `<span class="w3-jumbo material-symbols-outlined" style="float:left;margin-right:10px;">warning</span><span style="clear:left">Failed to load essential data</span>`;
  processName.innerHTML = failMsg;
  const progressMsg = document.getElementById("progressMsg");
  progressMsg.textContent = `something went wrong getting dataset ${dataset}`;
  document.getElementById("progressBarContainer").remove();
}

export function getNumMsps() {
  return gMsps.length;
}

export function getMspObject(mspIndexNum) {
  return gMsps[mspIndexNum];
}

function dataProgressUpdate(i) {
  const processName = document.getElementById("processName");
  const progressBar = document.getElementById("progressBar");
  const progressMsg = document.getElementById("progressMsg");
  const dataSets = [
    "members",
    "constituencies",
    "member election constituency statuses",
    "regions",
    "member election region statuses",
    "parties",
    "member parties"
  ];
  const progressPercent = ((i+1) / dataSets.length) * 100;
  progressBar.style.width = `${progressPercent}%`;
  progressMsg.textContent = `getting ${dataSets[i]}`;
  if (progressPercent === 100) {
    processName.textContent = "Making cards"
    progressBar.style.width = "0%";
    progressMsg.textContent = "";
  }
}



async function getMspData() {
  dataProgressUpdate(0);
  const mspsData = await getParliamentOpenData("members","json");
  const mspsAll = JSON.parse(mspsData);
  gMsps = mspsAll.filter(msp => msp.IsCurrent === true);
  dataProgressUpdate(1);
  const constituenciesData = await getParliamentOpenData("constituencies","json");
  const constituenciesList = JSON.parse(constituenciesData);
  dataProgressUpdate(2);
  const cSeatsData = await getParliamentOpenData("MemberElectionConstituencyStatuses","json");
  const cSeatsAll = JSON.parse(cSeatsData); 
  const cSeatsCurrent = cSeatsAll.filter(constituency => constituency.ElectionStatusID === 1);
  dataProgressUpdate(3);
  const regionsData = await getParliamentOpenData("regions","json");
  const regionsList = JSON.parse(regionsData);
  dataProgressUpdate(4);
  const rSeatsData = await getParliamentOpenData("MemberElectionregionStatuses","json");
  const rSeatsAll = JSON.parse(rSeatsData);
  const rSeatsCurrent = rSeatsAll.filter(region => region.ElectionStatusID === 1);
  dataProgressUpdate(5);
  const partiesData = await getParliamentOpenData("parties","json");
  const partiesList = JSON.parse(partiesData);
  dataProgressUpdate(6);
  const partyMembershipsData = await getParliamentOpenData("memberparties","json");
  const partyMembershipsAll = JSON.parse(partyMembershipsData);
  const partyMembershipsCurrent = partyMembershipsAll.filter(item => item.ValidUntilDate === null);
  gMsps.forEach((msp) => {
    const surname = msp.ParliamentaryName.split(",")[0];
    msp.displayName = `${msp.PreferredName} ${surname}`; 
    let electoralArea = null;
    const constituency = cSeatsCurrent.findLast(seat => seat.PersonID === msp.PersonID);
    if (constituency != null) {
      electoralArea = constituenciesList.find(({ID}) => ID === constituency.ConstituencyID).Name;
    };
    if (!constituency) {
      const region = rSeatsCurrent.findLast(seat => seat.PersonID === msp.PersonID);
      if (region != null) {
        electoralArea = regionsList.find(({ID}) => ID === region.RegionID).Name;
      };
    };
    if (electoralArea === null) {
      console.log(`could not find electoral area for ${msp.PreferredName}`);
      return;
    } else {
      msp.electoralArea = electoralArea;
    };
    let party = "Independent";
    const partyMembership = partyMembershipsCurrent.findLast(object => object.PersonID === msp.PersonID);
    if (partyMembership) {
      const partyObject = partiesList.find(party => party.ID === partyMembership.PartyID);
      if (partyObject) {
        party = partyObject.PreferredName;
      };
    };
    msp.party = party;
  });
  buildDeck();
}
getMspData();
