// SONGMODE=YOSHIMI
setBPM(120);
const drums = new TrackerPattern(output, 1, 4);
const base = new TrackerPattern(output, 7, 4);
const pad = new TrackerPattern(output, 0, 4);

const drumtrack = async () => drums.steps(4,[
        [c3,gs3(1,40)],,gs3(1,20),,
        [d3(1,127),gs3(1,40)],,gs3(1,20),,
        [c3,gs3(1,40)],,[c3,gs3(1,40)],,
        [d3(1,127),gs3(1,40)],,[c3,gs3(1,40)],,
      ]);

for(let n=0;n<2;n++) {  
  pad.steps(2, [
  	,a5,d6,f6,
    e6,,c6,d6
  ]);

  base.steps(4, [
    d3,,d4,,f3,,a4,,
    a2,,a3,,c3,,c4
  ]);

  await drumtrack()

  base.steps(4, [
    d3,,d4,,f3,,a4,,
    a2,,a3,,c3,,c4
  ]);

  await drumtrack();
}


pad.steps(2, [
  ,g5,c6,g5,
  f6,,e6,c6
]);

base.steps(4, [
  c3,,c4,,e3,,g4,,
  g2,,g3,,as3,,as4
]);

await drumtrack();
base.steps(4, [
  c3,,c4,,e3,,g4,,
  g2,,g3,,as3,,as4
]);

await drumtrack();

pad.steps(2, [
  	,a5,d6,f6,
    e6,,c6,d6
  ]);

base.steps(4, [
  d3,,d4,,f3,,a4,,
  a2,,a3,,c3,,c4
]);

await drumtrack();

base.steps(4, [
  d3,,d4,,f3,,a4,,
  a2,,a3,,c3,,c4,d4(1/8)
]);

await drumtrack();

loopHere();
