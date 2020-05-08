export function getInstrumentNamesFromYoshimiXML(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const instruments = doc.querySelectorAll('INSTRUMENT INFO string[name="name"]');

    const instrumentNames = [];
    for (let n=0; n<instruments.length; n++) {
        const instrumentName = instruments[n].firstChild.nodeValue;
        if (instrumentName === 'Simple Sound') {
            break;
        }
        instrumentNames.push(instrumentName);
    }
    return instrumentNames;
}