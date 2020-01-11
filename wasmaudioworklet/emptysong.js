global.bpm = 120;
global.pattern_size_shift = 4;

addInstrument('kick', {type: 'number'});
addInstrument('sinelead', {type: 'note'});

playPatterns({
	kick: pp(4, [
		64, , , ,
		64, , , ,
		64, , ,10,
		64, , 30, ,]),
   sinelead: pp(4, [
   		d5,,,a4,
     	,a4,,,
     	c5,d5,,f5,
     	,f5,d5
   ])
  
});
