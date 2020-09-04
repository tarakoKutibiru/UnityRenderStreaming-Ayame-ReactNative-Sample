import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, View, GestureResponderEvent, ARTClippingRectangleProps } from 'react-native';
import { Ayame, AyameEvent, AyameConnectionState } from './Ayame';

enum PointerPhase {
    None = 0,
    Began = 1,
    Moved = 2,
    Ended = 3,
    Canceled = 4,
    Stationary = 5
}

enum InputEvent {
    Keyboard = 0,
    Mouse = 1,
    MouseWheel = 2,
    Touch = 3,
    ButtonClick = 4,
    Gamepad = 5
};

interface TouchViewState {
    height: number,
    width: number,
    originX: number,
    originY: number,
}

interface TouchViewProps {
    ayame: Ayame | null;
}

export class TouchView extends React.Component<TouchViewProps, TouchViewState> {
    constructor(props: TouchViewProps) {
        super(props);

        this.state = {
            height: 0.,
            width: 0.,
            originX: 0.,
            originY: 0.,
        };
    }

    onLayout(e: { nativeEvent: { layout: { x: number, y: number, width: number, height: number } } }) {

        const videoWidth = e.nativeEvent.layout.width;
        const videoHeight = e.nativeEvent.layout.height;

        /* コンポーネントの高さを取得し、stateに保存 */
        this.setState({
            height: videoHeight,
            width: videoWidth,
            originX: e.nativeEvent.layout.x,
            originY: e.nativeEvent.layout.y,
        });
    }

    onTouchMoved(ev: GestureResponderEvent) {
        this.handleTouches(ev.nativeEvent, PointerPhase.Moved);
    }

    onTouchStart(ev: GestureResponderEvent) {
        this.handleTouches(ev.nativeEvent, PointerPhase.Began);
    }

    onTouchEnd(ev: GestureResponderEvent) {
        this.handleTouches(ev.nativeEvent, PointerPhase.Ended);
    }

    onTouchCancel(ev: GestureResponderEvent) {
        this.handleTouches(ev.nativeEvent, PointerPhase.Canceled);
    }

    handleTouches(e: any, phase: PointerPhase) {
        const changedTouches: any = Array.from(e.changedTouches);
        const touches: any = Array.from(e.touches);
        const phrases: any = [];

        for (let i = 0; i < changedTouches.length; i++) {
            if (touches.find(function (t: any) {
                return t.identifier === changedTouches[i].identifier
            }) === undefined) {
                touches.push(changedTouches[i]);
            }
        }

        for (let i = 0; i < touches.length; i++) {
            touches[i].identifier;
            phrases[i] = changedTouches.find(
                function (e: any) {
                    return e.identifier === touches[i].identifier
                }) === undefined ? PointerPhase.Stationary : phase;
        }

        // console.log("touch phase:" + phase + " length:" + changedTouches.length + " pageX" + changedTouches[0].pageX + ", pageX: " + changedTouches[0].pageY + ", force:" + changedTouches[0].force);

        let data = new DataView(new ArrayBuffer(2 + 17 * touches.length));
        data.setUint8(0, InputEvent.Touch);
        data.setUint8(1, touches.length);
        let byteOffset = 2;

        for (let i = 0; i < touches.length; i++) {
            const originX = this.state.originX;
            const originY = this.state.originY;

            let x = (touches[i].pageX);
            // According to Unity Coordinate system
            // const y = (touches[i].pageX - originY) / scale;
            let y = ((this.state.height - touches[i].locationY));

            console.log(`position_x: ${x}, position_y: ${y} `);

            data.setInt32(byteOffset, touches[i].identifier, true);
            byteOffset += 4;
            data.setUint8(byteOffset, phrases[i]);
            byteOffset += 1;
            data.setInt16(byteOffset, x, true);
            byteOffset += 2;
            data.setInt16(byteOffset, y, true);
            byteOffset += 2;
            data.setFloat32(byteOffset, touches[i].force, true);
            byteOffset += 4;
        }
        this.props.ayame?.sendMessage(data.buffer);
    }

    render() {
        return <View style={styles.body}
            onLayout={this.onLayout.bind(this)}
            onStartShouldSetResponder={(ev) => true}
            onResponderGrant={this.onTouchStart.bind(this)}
            onResponderMove={this.onTouchMoved.bind(this)}
            onResponderEnd={this.onTouchEnd.bind(this)}
            onTouchCancel={this.onTouchCancel.bind(this)}
        ></View>
    };
}

const styles = StyleSheet.create({
    body: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        // backgroundColor: "rgba(255,0,0,0.2)",
        zIndex: 2,
    },
});