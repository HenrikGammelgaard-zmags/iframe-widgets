/*global vjs, ytplayer, YT*/
/*jslint sloppy:true*/

vjs.Widget = vjs.MediaTechController.extend({
    init: function (player, options, ready) {
        vjs.MediaTechController.call(this, player, options, ready);

        this.player_ = player;
        this.ytplayer = player.options().ytPlayer;

        var scope = this;
        this.ytplayer.addEventListener("onReady", function () {
            scope.onReady();
        });
        this.ytplayer.addEventListener("onStateChange", function (state) {
            scope.onStateChange(state);
        });
        this.ytplayer.addEventListener("onError", function (error) {
            scope.onError(error);
        });

        setTimeout(function () {
            scope.player_.bigPlayButton.hide();
            scope.player_.controlBar.show();
            scope.player_.controlBar.fullscreenToggle.hide();
        }, 50);
    }
});

//vjs.Widget.prototype.canPlayType = function () {
//
//};

vjs.Widget.prototype.play = function () {
    if (this.isReady_) {
        this.ytplayer.playVideo();
    } else {
        // We will play it when the API will be ready
        this.playOnReady = true;
    }
};

vjs.Widget.prototype.pause = function () {
    this.ytplayer.pauseVideo();
};

vjs.Widget.prototype.paused = function () {
    return this.lastState !== YT.PlayerState.PLAYING &&
           this.lastState !== YT.PlayerState.BUFFERING;
};

vjs.Widget.prototype.currentTime = function () {
    return this.ytplayer.getCurrentTime();
};

vjs.Widget.prototype.setCurrentTime = function (seconds) {
    this.ytplayer.seekTo(seconds, true);
    this.player_.trigger('timeupdate');
};

vjs.Widget.prototype.duration = function () {
    return this.ytplayer.getDuration();
};

vjs.Widget.prototype.buffered = function () {
    var loadedBytes = this.ytplayer.getVideoBytesLoaded();
    var totalBytes = this.ytplayer.getVideoBytesTotal();
    if (!loadedBytes || !totalBytes) {
        return 0;
    }

    var duration = this.ytplayer.getDuration();
    var secondsBuffered = (loadedBytes / totalBytes) * duration;
    var secondsOffset = (this.ytplayer.getVideoStartBytes() / totalBytes) * duration;
    return vjs.createTimeRange(secondsOffset, secondsOffset + secondsBuffered);
};

vjs.Widget.prototype.volume = function () {
    if (isNaN(this.volumeVal)) {
        this.volumeVal = this.ytplayer.getVolume() / 100.0;
    }

    return this.volumeVal;
};

vjs.Widget.prototype.setVolume = function (percentAsDecimal) {
    if (percentAsDecimal && percentAsDecimal !== this.volumeVal) {
        this.ytplayer.setVolume(percentAsDecimal * 100.0);
        this.volumeVal = percentAsDecimal;
        this.player_.trigger('volumechange');
    }
};


vjs.Widget.prototype.muted = function () {
    return this.ytplayer.isMuted();
};

vjs.Widget.prototype.setMuted = function (muted) {
    if (muted) {
        this.ytplayer.mute();
    } else {
        this.ytplayer.unMute();
    }
};


vjs.Widget.prototype.supportsFullscreen = function () {
    return false;
};

vjs.Widget.prototype.onReady = function () {
    this.isReady_ = true;

    this.player_.trigger('techready');

    this.triggerReady();
    this.player_.trigger('durationchange');

    // Play right away if we clicked before ready
    if (this.playOnReady) {
//        this.player_.bigPlayButton.hide();
        this.ytplayer.playVideo();
    }
};

vjs.Widget.prototype.onStateChange = function (event) {
    var state = event.data;
    if (state !== this.lastState) {
        switch (state) {
        case -1:
            this.player_.trigger('durationchange');
            break;

        case YT.PlayerState.ENDED:
            this.player_.trigger('ended');
            break;

        case YT.PlayerState.PLAYING:
            this.player_.trigger('timeupdate');
            this.player_.trigger('durationchange');
            this.player_.trigger('playing');
            this.player_.trigger('play');
            break;

        case YT.PlayerState.PAUSED:
            this.player_.trigger('pause');
            break;

        case YT.PlayerState.BUFFERING:
            this.player_.trigger('timeupdate');
            this.player_.trigger('waiting');

            break;

        case YT.PlayerState.CUED:
            break;
        }

        this.lastState = state;
    }
};

vjs.Widget.prototype.onError = function (error) {
    this.player_.error = error;
    this.player_.trigger('error');
};

vjs.Widget.isSupported = function () {
    return true;
};

vjs.Widget.canPlaySource = function (srcObj) {
    return true;
};




vjs.ControlBar.prototype.fadeOut = function () {};