var electionStatusEventsArray
var partyMembershipArray
function getKeyData() {
    let cArray
    let rArray
    let tempArray
    document.getElementById("cardPic").style.display = "none"
    fetch('https://data.parliament.scot/api/memberparties')
    .then(response => response.json())
    .then(json => tempArray = json)
    .then(() => partyMembershipArray = tempArray.filter(obj => obj.ValidUntilDate == null))
    .catch(err => console.log("Request failed", err))
    .then(() => fetch('https://data.parliament.scot/api/MemberElectionConstituencyStatuses'))
    .then(response => response.json())
    .then(json => cArray = json.filter(obj => obj.ElectionStatusID == 1))
    .then(() => fetch('https://data.parliament.scot/api/MemberElectionregionStatuses'))
    .then(response => response.json())
    .then(json => rArray = json.filter(obj => obj.ElectionStatusID == 1))
    .then(() => electionStatusEventsArray = cArray.concat(rArray))
    .then(() => randomise())
}
function getKeyData2() {
  let tempArray
  fetch('https://data.parliament.scot/api/MemberElectionConstituencyStatuses')
  .then(response => response.json())
//  .then(json => console.log(json[0]))
  .then(json => tempArray = json)
  .then(() => partyMembershipArray = tempArray.filter(obj => obj.ValidUntilDate == null))
  .catch(err => console.log("Request failed", err))
}
function randomise() {
  for (let i = electionStatusEventsArray.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i)
    let k = electionStatusEventsArray[i]
    electionStatusEventsArray[i] = electionStatusEventsArray[j]
    electionStatusEventsArray[j] = k
  }
  document.getElementById("currentCardNum").innerHTML = 1
  turnCard("ignore")
}
function turnCard(direction) {
   for (let i = 0; i < document.querySelectorAll("details").length; i++) {
     document.getElementsByTagName("details")[i].removeAttribute("open")
   }
   document.getElementById("lds-ring").style.display = "block"
   document.getElementById("cardPic").style.display = "none"
   let i = parseInt(document.getElementById("currentCardNum").textContent)
   if (direction == "forward" && i < electionStatusEventsArray.length) { // need to revisit .length -1?
      i = i + 1
   } 
   document.getElementById("currentCardNum").innerHTML = i
   addNameAndPicture((i - 1))
   addSeat((i - 1))
   addParty((i-1))
}
function showPicture() {
   document.getElementById("lds-ring").style.display = "none"
   document.getElementById("cardPic").style.display = "block"
}
function addParty(i) {
  let personID = electionStatusEventsArray[i].PersonID
  for (let j = partyMembershipArray.length - 1; j >= 0; j--) {
    if (personID == partyMembershipArray[j].PersonID) {
       fetch('https://data.parliament.scot/api/parties/' + partyMembershipArray[j].PartyID)
       .then(response => response.json())
       .then(json => document.getElementById("mspPartyText").textContent = json.PreferredName)
       break
    }
   } 
}
  function outputNames() {
    let strOutput = "";
    let iJson;
    for (let i = 0; i < 1; i++) {
      console.log(strOutput)
      fetch('https://data.parliament.scot/api/members/' + electionStatusEventsArray[i].PersonID)
      .then(response => response.json())
      .then(json => iJson = json)
      .then(() => console.log(iJson.ParliamentaryName))
      .then(() => strOutput = strOutput + "<p>" + electionStatusEventsArray[i].PersonID + ": ")
      .then(() => strOutput = strOutput + iJson.ParliamentaryName + "</p>")
      .then(() => console.log(strOutput))
      .then(() =>  document.getElementById('testArea').innerHTML = strOutput)
      .catch(err => console.log('Request failed', err))
   }
}
  function addNameAndPicture(i) {
    fetch('https://data.parliament.scot/api/members/' + electionStatusEventsArray[i].PersonID)
    .then(response => response.json())
    .then(json => iJson = json)
    .then(() => document.getElementById("cardPic").src = iJson.PhotoURL)
    .then(() => nameArray = iJson.ParliamentaryName.split(","))
    .then(() => document.getElementById("mspNameText").textContent = nameArray[1] + " " +  nameArray[0])
}
async function addSeat(i) {
  if (electionStatusEventsArray[i].hasOwnProperty("ConstituencyID")) {
    fetch('https://data.parliament.scot/api/constituencies/' + electionStatusEventsArray[i].ConstituencyID)
    .then(response => response.json())
    .then(json => kJson = json)
    .then(() => document.getElementById("mspSeatText").textContent = kJson.Name)
  } else {
    fetch('https://data.parliament.scot/api/regions/' + electionStatusEventsArray[i].RegionID)
    .then(response => response.json())
    .then(json => kJson = json)
    .then(() => document.getElementById("mspSeatText").textContent = kJson.Name)
  }
}
  function buildElectionStatusEventsArray(cJson, rJson) {
    console.log(json.length)
 //   for (let i = 0; i < json.length; i++) {
 //     console.log(json[i].ElectionStatusID)
 //     if (json[i].ElectionStatusID == 1) {
 //       delete json[i]
 //     } 
 //   }
    let newArray = json.filter(jObject => jObject.ElectionStatusID == 1)
    console.log(newArray.length)
}
  function getRegionElectionStatusEvents() {
    fetch('https://data.parliament.scot/api/MemberElectionregionStatuses')
    .then(function fill(response) {
        rJson = response.json()
    })
    .then((json => document.getElementById('testArea').innerHTML = cJson[0].PersonID))
	    .catch(err => console.log('Request failed', err))
  }
