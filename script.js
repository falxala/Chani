var encoder;

function createGIF() {
    //canvasの取得
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    //GIFEncoderの初期処理
    encoder = new GIFEncoder();
    encoder.setRepeat(0); //繰り返し回数 0=無限ループ
    encoder.setDelay(100); //1コマあたりの待機秒数（ミリ秒）
    encoder.start();
    //画像ファイル一覧を取得
    frames = document.getElementById('anime').getElementsByTagName('img');
    //canvasのサイズを1枚目のコマに合わせる
    canvas.width = frames[0].naturalWidth;
    canvas.height = frames[0].naturalHeight;
    //全ての画像をcanvasへ描画
    for (var frame_no = 0; frame_no < lipsyncList.length; frame_no++) {
        if (lipsyncList[frame_no] == 0) {
            ctx.drawImage(frames[0], 0, 0);
            encoder.addFrame(ctx); //コマ追加
        }
        if (lipsyncList[frame_no] != 0) {
            ctx.drawImage(frames[1], 0, 0);
            encoder.addFrame(ctx); //コマ追加
        }
    }
    //アニメGIFの生成
    encoder.finish();
    document.getElementById('anime_gif').src = 'data:image/gif;base64,' + encode64(encoder.stream().getData());
}

function dragOverHandler(ev) {
    console.log("File(s) in drop zone");

    // 既定の動作で防ぐ（ファイルが開かれないようにする）
    ev.preventDefault();
}

function dropHandler(ev) {
    console.log("File(s) dropped");

    // 既定の動作で防ぐ（ファイルが開かれないようにする）
    ev.preventDefault();

    console.log(ev.toElement);

    if (ev.dataTransfer.items) {
        // DataTransferItemList インターフェイスを使用して、ファイルにアクセスする
        [...ev.dataTransfer.items].forEach((item, i) => {
            // ドロップしたものがファイルでない場合は拒否する
            if (item.kind === "file") {
                const file = item.getAsFile();
                //console.log(`file[${i}].name = ${file.name}`);
                const reader = new FileReader();
                reader.onload = () => {
                    console.log(file.name);
                    console.log(file.type);
                    const fileUrl = URL.createObjectURL(file)
                    if (file.type.indexOf('audio') != -1)
                        wavesurfer.load(fileUrl);

                    if (file.type.indexOf('image') != -1) {
                        if (ev.toElement.getAttribute("name") == "I1")
                            document.getElementById('im1').src = fileUrl;
                        if (ev.toElement.getAttribute("name") == "I2")
                            document.getElementById('im2').src = fileUrl;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    } else {
        // DataTransfer インターフェイスを使用してファイルにアクセスする
        [...ev.dataTransfer.files].forEach((file, i) => {
            console.log(`file[${i}].name = ${file.name}`);
        });
    }
}

var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#137a7f',
    progressColor: 'purple',
    //audioRate: 2,
    //splitChannels: true,
    //normalize: true,
});

var lipsyncList = [];

playstop = () => {
    if (wavesurfer.isPlaying()) {
        wavesurfer.setTime(0);
        wavesurfer.pause();
    }
    else {
        wavesurfer.play();
        decodeData = wavesurfer.getDecodedData();
        var buffer = decodeData.getChannelData(0);
        var len = decodeData.length;
        var sampleRate = decodeData.sampleRate;
        var duration = decodeData.duration;
        console.log(len);
        console.log(sampleRate);
        console.log(duration);
        var split = sampleRate / 10;//1秒を10分割

        var peak = 0;
        for (let i = 0; len > i; i++) {
            if (peak < Math.abs(buffer[i])) {
                peak = Math.abs(buffer[i])
            }
        }
        console.log(peak);
        var median = peak / 2;

        for (let i = 0; len > i; i++) {
            if (i % split == 0) {
                var level = Math.abs(buffer[i]);
                if (level > (peak / 3))
                    lipsyncList.push(2)
                else if (level > (peak / 30))
                    lipsyncList.push(1)
                else
                    lipsyncList.push(0)
            }
        }
        console.log(lipsyncList);
    }
}


