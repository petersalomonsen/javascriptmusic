var soundCloudIframeElement   = document.querySelector('iframe');
var scWidget = SC.Widget(soundCloudIframeElement);

var needSongPositionSync = false;
scWidget.bind(SC.Widget.Events.PLAY, () => {
    scWidget.setVolume(27);
    needSongPositionSync = true;
    startaudio();
});
scWidget.bind(SC.Widget.Events.PLAY_PROGRESS, (evt) => {
    if(needSongPositionSync) {
        setSongPositionMillis(evt.currentPosition);
         // needSongPositionSync = false;
         // console.log('song position', evt.currentPosition);
    }
});
scWidget.bind(SC.Widget.Events.SEEK, () => needSongPositionSync = true);
scWidget.bind(SC.Widget.Events.PAUSE, () => {
    needSongPositionSync = true;
    stopaudio();
});
scWidget.bind(SC.Widget.Events.FINISH, () => {
    needSongPositionSync = true;
    stopaudio();
});
