const fs = require('fs');
const instruments = {
    base: ['BA_Dark.inc',
    'BA_DarkChorus.inc',
    'BA_Deepness.inc',
    'BA_DirectPunchMS.inc',
    'BA_Mighty.inc',
    'BA_Mighty_Feedback.inc',
    'BA_NotFromThisWorld.inc',
    'BA_NotFromThisWorld2.inc',
    'BA_SawBass.inc',
    'BA_SawBassFlanger.inc',
    'bass.inc',
    'bass2.inc',
    'pOWL_BAS_Dubstep03.inc',
    'pOWL_BAS_Dubstep07.inc',
], ga: [
    'GA_RestInPeaceMS.inc',
], keyboard: [
    'KY_GarageOrgan.inc',
    'KY_GarageOrganChorus.inc',
    'KY_Lullaby.inc',
    'KY_Lullaby2.inc',
    'KY_Rhodes.inc',
    'piano.inc',
    'piano2.inc',
], lead: [
    'LD_AlphaOmegaMS.inc',
    'LD_Farscape.inc',
    'LD_More&MoreMS.inc',
    'LD_Morpher.inc',
    'LD_RestInPeaceMS.inc',
    'LD_Short&PunchyMS.inc',
], pad: [
    'PA_Fairies.inc',
    'PA_Jarresque.inc',
    'PA_JarresqueChorus.inc',
    'PA_LoFiChoir.inc',
    'PA_LongPad.inc',
    'PA_Minorium.inc',
    'PA_Strangeland.inc',
    'PA_StrangelandChorus.inc',
    'PA_SynastasiaMS.inc',
    'pad.inc',
    'pad2.inc',
], synth: [
    'SY_RandomArp.inc',
    'SY_RandomArpFlanger.inc',
    'airy.inc',
    'string.inc',
    'synth.inc',
    'synthFlanger.inc',
    'test.inc'
], drum: [
    'basedrum.inc',
    'basedrum2.inc',
    'basedrum3.inc',
    'basedrum4.inc',
    
    'clap.inc',
    'hihat.inc',
    'hihat2.inc',
    
    'rimshot.inc',
    'snare.inc',
    'snare2.inc',
    'snare3.inc',
    'snare4.inc',
    'snare5.inc',
    'snare6.inc',
    ],
    plucked: [
        'guitar.inc',
        'guitar2.inc',    
    ]
};


const loadinstrumentfromstring = (instrumentdef) => instrumentdef.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join('\n');
const loadinstrumentfromfile = (filename) => loadinstrumentfromstring(new String(fs.readFileSync('instruments/' + filename)));

const instrumentmap = {};
Object.keys(instruments).forEach(category =>
        instrumentmap[category] = (instrindex) =>
            loadinstrumentfromfile(instruments[category][instrindex])
);
        
module.exports = {
    map: instrumentmap,
    loadinstrumentfromfile: loadinstrumentfromfile,
    loadinstrumentfromstring: loadinstrumentfromstring
}