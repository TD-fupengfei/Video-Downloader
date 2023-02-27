// ==UserScript==
// @name         Unlimited_downloader
// @name:zh-CN   无限制下载器
// @namespace    ooooooooo.io
// @version      0.1.8
// @description  Get video and audio binary streams directly, breaking all download limitations. (As long as you can play, then you can download!)
// @description:zh-Cn  直接获取视频和音频二进制流，打破所有下载限制。（只要你可以播放，你就可以下载！）
// @author       dabaisuv, alex hua
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';
    console.log(`Unlimited_downloader: begin......${location.href}`);


    //Setting it to 1 will automatically download the video after it finishes playing.
    window.autoDownload = 1;


    window.isComplete = 0;
    window.audio = [];
    window.video = [];
    window.downloadAll = 0;
    window.quickPlay = 1.0;

    const _endOfStream = window.MediaSource.prototype.endOfStream
    window.MediaSource.prototype.endOfStream = function () {
        window.isComplete = 1;
        return _endOfStream.apply(this, arguments)
    }
    window.MediaSource.prototype.endOfStream.toString = function () {
        console.log('endOfStream hook is detecting!');
        return _endOfStream.toString();
    }

    const _addSourceBuffer = window.MediaSource.prototype.addSourceBuffer
    window.MediaSource.prototype.addSourceBuffer = function (mime) {
        console.log("MediaSource.addSourceBuffer", mime)
        if (mime.toString().indexOf('audio') !== -1) {
            window.audio = [];
            console.log('audio array cleared.');
        } else if (mime.toString().indexOf('video') !== -1) {
            window.video = [];
            console.log('video array cleared.');
        }
        let sourceBuffer = _addSourceBuffer.call(this, mime)
        const _append = sourceBuffer.appendBuffer
        sourceBuffer.appendBuffer = function (buffer) {
            // console.log(mime, buffer);
            if (mime.toString().indexOf('audio') !== -1) {
                window.audio.push(buffer);
            } else if (mime.toString().indexOf('video') !== -1) {
                window.video.push(buffer)
            }
            _append.call(this, buffer)
        }

        sourceBuffer.appendBuffer.toString = function () {
            console.log('appendSourceBuffer hook is detecting!');
            return _append.toString();
        }

        window.downloadAll = 0;
        window.isComplete = 0;
        let btn = document.querySelector("#download-btn")
        if (btn) {
            btn.disabled = true
            btn.innerText = '...'
            btn.style.cursor = 'wait'
        }
        return sourceBuffer
    }

    window.MediaSource.prototype.addSourceBuffer.toString = function () {
        console.log('addSourceBuffer hook is detecting!');
        return _addSourceBuffer.toString();
    }

    function download() {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob(window.audio));
        a.download = 'audio_' + document.title + '.mp4';
        a.click();
        a.href = window.URL.createObjectURL(new Blob(window.video));
        a.download = 'video_' + document.title + '.mp4';
        a.click();
        window.downloadAll = 0;
        window.isComplete = 0;


        // window.open(window.URL.createObjectURL(new Blob(window.audio)));
        // window.open(window.URL.createObjectURL(new Blob(window.video)));
        // window.downloadAll = 0

        // GM_download(window.URL.createObjectURL(new Blob(window.audio)));
        // GM_download(window.URL.createObjectURL(new Blob(window.video)));
        // window.isComplete = 0;

        // const { createFFmpeg } = FFmpeg;
        // const ffmpeg = createFFmpeg({ log: true });
        // (async () => {
        //     const { audioName } = new File([new Blob(window.audio)], 'audio');
        //     const { videoName } = new File([new Blob(window.video)], 'video')
        //     await ffmpeg.load();
        //     //ffmpeg -i audioLess.mp4 -i sampleAudio.mp3 -c copy output.mp4
        //     await ffmpeg.run('-i', audioName, '-i', videoName, '-c', 'copy', 'output.mp4');
        //     const data = ffmpeg.FS('readFile', 'output.mp4');
        //     let a = document.createElement('a');
        //     let blobUrl = new Blob([data.buffer], { type: 'video/mp4' })
        //     console.log(blobUrl);
        //     a.href = URL.createObjectURL(blobUrl);
        //     a.download = 'output.mp4';
        //     a.click();
        // })()
        // window.downloadAll = 0;
    }

    // setInterval(() => {
    //     if (window.downloadAll === 1) {
    //         download();
    //     }
    // }, 2000);

    //    setInterval(() => {
    //        if(window.quickPlay !==1.0){
    //              document.querySelector('video').playbackRate = window.quickPlay;
    // }
    //
    //   }, 2000);

    if (window.autoDownload === 1) {
        let autoDownInterval = setInterval(() => {
            //document.querySelector('video').playbackRate = 16.0;
            if (window.isComplete === 1) {
                let btn = document.querySelector("#download-btn")
                if (btn) {
                    btn.disabled = false
                    btn.innerText = '🢃'
                    btn.style.cursor = 'pointer'
                }
            }
        }, 1000);
    }

    (function (that) {
        let removeSandboxInterval = setInterval(() => {
            if (that.document.querySelectorAll('iframe')[0] !== undefined) {
                that.document.querySelectorAll('iframe').forEach((v, i, a) => {
                    let ifr = v;
                    // ifr.sandbox.add('allow-popups');
                    ifr.removeAttribute('sandbox');
                    const parentElem = that.document.querySelectorAll('iframe')[i].parentElement;
                    a[i].remove();
                    parentElem.appendChild(ifr);
                });
                clearInterval(removeSandboxInterval);
            }
        }, 1000);
    })(window);

    function insertCss() {
        // 创建一个style元素
        const styleElement = document.createElement('style');

        // 定义CSS代码
        const cssCode = `
       #download {
            background-color: #4CAF50; /* 设置背景色 */
            border: none; /* 去除边框 */
            border-radius: 50%; /* 设置圆形 */
            font-size: 1.2rem; /* 设置字体大小 */
            padding: .6rem; /* 设置内边距 */
            position: fixed; /* 设置固定位置 */
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); /* 设置阴影 */
            transition: transform 0.2s ease-in-out; /* 设置动画效果 */
        }
        #download:hover {
            transform: scale(1.1); /* 鼠标悬停时放大按钮 */
        }
        #download-btn {
            padding-top: 0.25rem;
            min-width: 2rem;
            min-height: 2rem;
            border: none;
            color: black;
            border-radius: 50%;
            background-color: #eeeeeebf;
            cursor: wait; /* 设置光标形状 */
        }`;

        // 将CSS代码设置为style元素的文本内容
        styleElement.textContent = cssCode;

        // 将style元素插入到HTML文档中的head元素中
        document.head.appendChild(styleElement);
    }

    window.addEventListener('load', insertDownloadBtn)

    function insertDownloadBtn() {
        console.log("insert download button start")
        const video = document.querySelector('video')
        if (!video) return
        insertCss()
        const btn = document.createElement('button');
        btn.id = 'download-btn';
        btn.innerText = '...'
        btn.disabled = true;
        btn.onclick = download;
        const body = document.querySelector('body')
        const div = document.createElement('div')
        div.id = "download"
        div.appendChild(btn)
        body.appendChild(div)
        console.log("insert download button end")
    }


    // Your code here...
})();
