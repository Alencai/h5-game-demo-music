var default_speed = 400;


cc.Class({
    extends: cc.Component,

    properties: {
        c_bread: { default: null, type: cc.Node},
        c_time: { default: null, type: cc.Label},
        c_bglist: { default: [], type: [cc.Node]},
        c_musicurl: { default: null, url: cc.AudioClip},
    },

    // node
    onLoad () {
        this._arrLines = [];
        for (var i = 0; i < this.c_bglist.length; ++i) {
            this.c_bglist[i].active = false;   
            this._arrLines.push([]);
        }
        this.c_bread.active = false;
        this._start = false;
        this.c_time.string = "";
    },

    // self
    reset(json) {
        // cc.log(json);
        if (!json || !json.frames || json.frames.length == 0) {
            this._start = false;
            return;
        }
        var dropTime = parseInt(this.node.height * 1000 / default_speed);
        this._json = json;
        this._start = true;
        this._time = dropTime;
        this._step = 0;
        this._showTime = 0;
        while(json.frames[this._step][0] <= dropTime + dropTime) {
            ++ this._step;
        }
        cc.audioEngine.stopAll();
        cc.audioEngine.play(this.c_musicurl, false, 1);
    },

    // node
    start() {
        this.reset(require('music'));
    },

    // self
    move(dt) {
        var arrBg = this.c_bglist;
        for (var idx in arrBg){
            arrBg[idx].active = false;
        }
        var arrLines = this._arrLines;
        for (var idx in arrLines) {
            var arrBreads = arrLines[idx];
            for (var i = 0; i < arrBreads.length;) {
                arrBreads[i].y -= dt * default_speed;
                if (arrBreads[i].y < arrBg[idx].y) {
                    arrBreads[i].destroy();
                    arrBreads.splice(i, 1);
                    continue;
                }
                if (arrBreads[i].y - arrBreads[i].height < arrBg[idx].y) {
                    arrBg[idx].active = true;
                }
                ++ i;
            }
        }
    },

    // self
    add(line, len) {
        // cc.log(line, len);
        if (line >= this.c_bglist.length) {
            return;
        }
        var bread = cc.instantiate(this.c_bread);
        bread.active = true;
        bread.x = this.c_bglist[line].x;
        bread.y = this.c_bglist[line].y + this.c_bglist[line].height;
        this._arrLines[line].push(bread);
        this.node.addChild(bread, 1);
    },

    // node
    update(dt) {
        this.move(dt);
        if (!this._start) {  
            this.c_time.string = "";
            return;
        }
        this._time += parseInt(1000 * dt);
        this._showTime += dt;
        this.c_time.string = '' + parseInt(1000 * this._showTime);
        if (this._time >= this._json.time) {
            this._start = false;
            this.reset(this._json);
            return;
        }
        var arrData = this._json.frames[this._step];
        if (this._time >= arrData[0]) {
            for (var i = 1; i < arrData.length; ++i) {
                this.add(arrData[i][0], arrData[i][1]);
            }
            ++ this._step;
            if (this._step >= this._json.frames.length) {
                this._start = false;
                this.reset(this._json);
            }
        }
    },

    // self 
    evtImportCfg() {
        if (this.c_eleImportCfg) {
            this.c_eleImportCfg.click();
            return;
        }
        var reset = this.reset.bind(this);
        var GameCanvas = document.getElementById("GameCanvas");
        var upload = document.createElement("input");
        upload.style="height: 120px;";
        upload.type="file";
        upload.style.display="none";
        upload.onchange = function() {
            var localFile = upload.files[0];
            var reader = new FileReader();
            reader.onload = function(event) {
                reset(JSON.parse(event.target.result));
            }
            reader.onerror = function(event) {
            }
            reader.readAsText(localFile, "UTF-8");
            upload.value = null;
        };
        document.body.appendChild(upload);
        this.c_eleImportCfg = upload;
        this.c_eleImportCfg.click();
    },
});
