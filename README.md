# UnityRenderStreaming-Ayame-ReactNativeSample

![image](https://github.com/tarakoKutibiru/UnityRenderStreaming-Ayame-ReactNative-Sample/blob/image/Image/b.gif?raw=true)

# これは何

[UnityRenderStreaming-Ayame-Sample](https://github.com/tarakoKutibiru/UnityRenderStreaming-Ayame-Sample)で送信された映像の受信を行うReact Native製のアプリケーションです。

時雨堂様が公開してくださっている[react-native-webrtc-kit-samplesのAyameのサンプル](https://github.com/react-native-webrtc-kit/react-native-webrtc-kit-samples/tree/develop/HelloAyame)を改造して作成しました。

Androidで動作することを確認しています。
iOSで動作するかどうかは未確認です。

# 機能
UnityRenderStreamingのWebAPP側の機能は網羅しているつもりです。

- UnityRenderStreamingから送信された映像を表示する
- UnityRenderStreamingから送信された音声を再生する
- DataChannnelを使ってボタンのイベントを送信する。
    UnityRenderStreaming側のライトのオンとオフを操作できます。
    UnityRenderStreaming側のオーディオを再生できます。
- タッチイベントを送信する。
    画面をタッチしてカメラを動かすことができます。

# 既知の問題
- タッチ位置が正確じゃない。
    タッチ座標の計算が適当なので、タッチされた位置を正確に表示できません。
- 不要なデータを送信している。
    スマホのカメラ映像とマイク音声を送信する処理が削除できていません。
    UnityRenderStreamingは映像と音声の受信に対応していないようなので、スマホのカメラ映像とマイク音声の送信は本来必要ありません。
- コードが雑
    とり急ぎ公開したかったので、雑なコードを許容して公開しました。気が向いたらリファクタするかも？

# Setup

動作させるためにはシグナリングの設定が必要です。

HelloAyame/app.json
```
{
  "name": "HelloAyame",
  "displayName": "HelloAyame",
  "signalingUrl": "wss://ayame-lite.shiguredo.jp/signaling",
  "defaultRoomId": "xxxxx",
  "defaultSignalingKey": "xxxxx"
}
```

RoomIDとSignalingKeyをapp.jsonに設定してください。

# Build

```
cd HelloAyame
yarn install
npx react-native run-android
```

# Cache Clear

```
cd HelloAyame/android
./gradlew clean
```

# Discord

UnityでAyameを利用する人のためのコミュニティを作ってみました。私自身がサポートする可能性は低いですが、開発者同士の議論の場として使って頂けると嬉しいです。

[Discord](https://discord.gg/wGSG6SjkPA)