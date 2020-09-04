import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View, PermissionsAndroid, Platform, ColorPropType, Image, TouchableOpacity } from 'react-native';
import { Button, TextInput, BottomNavigation } from 'react-native-paper';

import {
  RTCMediaStreamTrack,
  RTCRtpReceiver,
  RTCRtpSender,
  RTCVideoView,

  RTCObjectFit,
  RTCLogger as logger,
  // react-native-webrtc-kit には TypeScript の型定義が用意されていないため、@ts-ignore で握りつぶしています。
  // TODO(enm10k): react-native-webrtc-kit が TypeScript 化されたら、@ts-ignore を外す
  // @ts-ignore
} from 'react-native-webrtc-kit';

import { TouchView } from './TouchView';
import { Ayame, AyameEvent, AyameConnectionState } from './Ayame';
import { signalingUrl, defaultRoomId, defaultSignalingKey } from './app.json';
import Toast from 'react-native-simple-toast';
import { RadioButtonItem } from 'react-native-paper/lib/typescript/src/components/RadioButton/RadioButtonItem';
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import { CLIENT_RENEG_WINDOW } from 'tls';

logger.setDebugMode(true);

async function requestPermissionsAndroid() {
  try {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);
  } catch (err) {
    console.warn(err);
  }
}

function randomString(strLength: number): string {
  var result = [];
  var charSet = '0123456789';
  while (strLength--) {
    result.push(charSet.charAt(Math.floor(Math.random() * charSet.length)));
  }
  return result.join('');
}

interface RTCRtpReceiver {
  track: {
    kind: string;
  };
}

interface RTCRtpSender {
  track: {
    kind: string;
  };
}

interface AppProps {

}

interface AppState {
  roomId: string;
  clientId: string;
  signalingKey: string;
  ayame: Ayame | null;
  sender: RTCRtpSender | null;
  receiver: RTCRtpReceiver | null;
  objectFit: RTCObjectFit | null;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state =
    {
      roomId: defaultRoomId,
      clientId: randomString(17),
      signalingKey: defaultSignalingKey,
      ayame: null,
      sender: null,
      receiver: null,
      objectFit: 'contain',
    };

  }

  connect() {
    if (this.isConnecting()) {
      this.disconnect();
    }

    const ayame = new Ayame(signalingUrl, this.state.roomId, this.state.clientId, this.state.signalingKey);
    ayame.ondisconnect = () => {
      Toast.show('on disconnect');
      this.setState({ ayame: null, sender: null, receiver: null });
    };
    ayame.onconnectionstatechange = (event: { target: { connectionState: string } }) => { this.onConnectionStateChange(ayame, event); };
    ayame.connect();
    this.setState({ ayame: ayame });
  }

  isConnecting() {
    return this.state.ayame !== null;
  }

  disconnect() {
    if (!this.isConnecting()) return;

    this.state.ayame?.disconnect();
  }

  onConnectionStateChange(ayame: Ayame, event: { target: { connectionState: string } }) {
    Toast.show(event.target.connectionState);
    switch (event.target.connectionState) {
      case AyameConnectionState.CONNECTED:
        {
          const videoReceiver = ayame._pc.receivers.find((each: RTCRtpReceiver) => { return each.track.kind === 'video'; });
          this.setState({ receiver: videoReceiver });
          break;
        }

      default:
        break;
    }
  }

  onTouchEvent(name: string, ev: any) {
    console.log(
      `[${name}] ` +
      `root_x: ${ev.nativeEvent.pageX}, root_y: ${ev.nativeEvent.pageY} ` +
      `target_x: ${ev.nativeEvent.locationX}, target_y: ${ev.nativeEvent.locationY} ` +
      `target: ${ev.nativeEvent.target}`
    );
  }

  createConnectiongVideoView() {
    const videoHeader =
      (
        <View style={styles.video_header}>
          <View style={styles.button_container_right} >
            <Button mode="contained" style={styles.button}
              onPress={() => { this.disconnect(); }}>Close</Button>
          </View>
        </View>
      );

    const videoFooter =
      (
        <View style={styles.video_footer}>
          <View style={styles.button_container_left} >
            <Button color="#4CAF50" mode="contained" style={styles.button}
              onPress={() => {
                Toast.show('Light off');
                this.state.ayame?.sendClickEvent(2);
              }}>Light off</Button>
            <Button color="#447FAF" mode="contained" style={styles.button}
              onPress={() => {
                Toast.show('Light on');
                this.state.ayame?.sendClickEvent(1);
              }}>Light on</Button>
            <Button color="#FF7700" mode="contained" style={styles.button}
              onPress={() => {
                Toast.show('Play audio');
                this.state.ayame?.sendClickEvent(3);
              }}>Play audio</Button>
          </View>
        </View>
      );

    const videoView =
      (
        <View style={styles.video_container}>
          {videoHeader}
          <RTCVideoView style={styles.videoview} track={this.state.receiver ? this.state.receiver.track : null} objectFit={this.state.objectFit} pointerEvents={"none"} />
          <TouchView ayame={this.state.ayame}></TouchView>
          {videoFooter}
        </View >
      );

    return videoView;
  }

  createUnconnectiongVideoView() {
    const videoView =
      (
        <View style={styles.video_container}>
          <RTCVideoView style={styles.videoview} track={this.state.receiver ? this.state.receiver.track : null} objectFit={this.state.objectFit} pointerEvents={"none"} />
          <View style={styles.videoview}>
            <TouchableOpacity style={styles.center} onPress={() => { this.connect(); }}  >
              <Image source={require('./images/Play.png')} style={styles.play_button} />
            </TouchableOpacity>
          </View>
        </View>
      );

    return videoView;
  }

  componentWillUnmount() {
    this.disconnect();
  }

  render() {
    hideNavigationBar();

    if (Platform.OS === 'android') {
      requestPermissionsAndroid();
    }

    let videoView;
    if (this.isConnecting()) {
      videoView = this.createConnectiongVideoView();
    }
    else {
      videoView = this.createUnconnectiongVideoView();
    }

    return (
      <View style={styles.body}>
        <View style={styles.div_content}>
          {videoView}
        </View>
      </View>);
  };
}

export default App;

const styles = StyleSheet.create({
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: '#F5FCFF',
    padding: 0,
  },
  div_content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'white',
  },
  video_container: {
    flex: 1,
    aspectRatio: 16.0 / 9.0,
    backgroundColor: 'black',
    elevation: 4,
  },
  videoview: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: '#323232',
    zIndex: 1,
  },
  video_controll: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: 3,
  },
  button_container_right: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button_container_left: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    marginHorizontal: 10,
  },

  video_header: {
    position: 'absolute',
    top: 5,
    zIndex: 4,
    width: '100%',
  },

  video_footer: {
    position: 'absolute',
    bottom: 5,
    zIndex: 5,
    width: '100%',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  play_button: {
    width: '30%',
    height: '30%',
    resizeMode: 'contain',
  },
});