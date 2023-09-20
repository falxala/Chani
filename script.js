function dragOverHandler(ev) {
    console.log("File(s) in drop zone");

    // 既定の動作で防ぐ（ファイルが開かれないようにする）
    ev.preventDefault();
}

function dropHandler(ev) {
    console.log("File(s) dropped");

    // 既定の動作で防ぐ（ファイルが開かれないようにする）
    ev.preventDefault();

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
                };
                reader.readAsDataURL(file);
                const fileUrl = URL.createObjectURL(file)
                wavesurfer.load(fileUrl);
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
        var split = sampleRate / 5;//1秒を５分割

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
                    console.log(2)
                else if (level > (peak / 9))
                    console.log(1)
                else
                    console.log(0);
            }
        }
    }
}


