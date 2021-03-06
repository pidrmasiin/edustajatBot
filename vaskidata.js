const axios = require('axios');
var parser = require('fast-xml-parser');
const util = require('util')

const getSpeaks = async function (selectedMember) {
    try {
    let startValue = 146851
    let vaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/VaskiData/batch?pkStartValue=${startValue}&pkName=Id`)

    let i = vaski.data.rowCount
    while (i > 99) {
        startValue = startValue + 30
        vaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/VaskiData/batch?pkStartValue=${startValue}&pkName=Id`)
        i = vaski.data.rowCount
    }
    
    let rowId = vaski.data.rowData.length
    let puheenvuorot;


    let data;
    let aihe;
    let random;
    let puheenosat;
    while (rowId > 0) {
        data = parser.parse(vaski.data.rowData[rowId - 1][1]);
        try {
            puheenvuorot = data["ns11:Siirto"]['SiirtoAsiakirja']['RakenneAsiakirja']["ptk:PoytakirjaAsiakohta"]["vsk:Asiakohta"]["vsk:KeskusteluToimenpide"]["vsk:PuheenvuoroToimenpide"]
            aihe = data["ns11:Siirto"]['SiirtoAsiakirja']['RakenneAsiakirja']["ptk:PoytakirjaAsiakohta"]["vsk:Asiakohta"]['vsk:KohtaNimeke']['met1:NimekeTeksti']
            selectedMemberSpeaks = puheenvuorot.filter(x => Object.values(x["met:Toimija"]["org:Henkilo"]).join('').toLowerCase().includes(selectedMember))
            random = selectedMemberSpeaks[Math.floor(Math.random() * selectedMemberSpeaks.length)];
            puheenosat = random['vsk:PuheenvuoroOsa']['vsk:KohtaSisalto']["sis:KappaleKooste"]
            
            break;
        } catch {
        }
        rowId--;
        if(rowId == 1) {
            startValue = startValue - 100
            vaski = await axios.get(`https://avoindata.eduskunta.fi/api/v1/tables/VaskiData/batch?pkStartValue=${startValue}&pkName=Id`)
            rowId = vaski.data.rowData.length
        }
    }

    console.log(util.inspect(data, {showHidden: false, depth: null}))

    let puhe = 'VIRHE'


    if(typeof puheenosat == 'string') {
        puhe = puheenosat
    } else if(Array.isArray(puheenosat)) {
        let randomInt =  Math.floor(Math.random() * puheenosat.length)
        puhe = puheenosat[randomInt]
        if (!puhe || puhe.length < 10) {
            randomInt =  Math.floor(Math.random() * puheenosat.length)
            puhe = puheenosat[randomInt]
        }
    }

    
    const puhuja = Object.values(random["met:Toimija"]["org:Henkilo"]).join(' ')

    const speak = {
        aihe: aihe,
        puhe: puhe,
        puhuja: puhuja
    }

    console.log('spea', speak);
    return speak
  } catch(exception){
    console.log('VaskiData ' + exception.message);
  }
}

module.exports = {
    getSpeaks
  }