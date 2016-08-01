import * as utils from "utils/utils";
import {Label} from "ui/label";
import {View} from "ui/core/view";
import {GestureEventData, PanGestureEventData, PinchGestureEventData} from "ui/gestures";

let states = ["unknown", "start", "change", "end"];

let item: View;
let statusLbl: Label;

let density: number;
let prevDeltaX: number;
let prevDeltaY: number;
let startScale = 1;

export function pageLoaded(args) {
    const page = args.object;
    item = page.getViewById("item");
    statusLbl = page.getViewById("status");
    density = utils.layout.getDisplayDensity();

    item.translateX = 0;
    item.translateY = 0;
    item.scaleX = 1;
    item.scaleY = 1;

    updateStatus();
}

export function onPan(args: PanGestureEventData) {
    console.log("PAN[" + states[args.state] + "] deltaX: " + Math.round(args.deltaX) + " deltaY: " + Math.round(args.deltaY));

    if (args.state === 1) {
        prevDeltaX = 0;
        prevDeltaY = 0;
    }
    else if (args.state === 2) {
        item.translateX += args.deltaX - prevDeltaX;
        item.translateY += args.deltaY - prevDeltaY;

        prevDeltaX = args.deltaX;
        prevDeltaY = args.deltaY;
    }

    updateStatus();
}

export function onPinch(args: PinchGestureEventData) {
    console.log("PINCH[" + states[args.state] + "] scale: " + args.scale + " focusX: " + args.getFocusX() + " focusY: " + args.getFocusY());

    if (args.state === 1) {
        const newOriginX = args.getFocusX() - item.translateX;
        const newOriginY = args.getFocusY() - item.translateY;

        const oldOriginX = item.originX * item.getMeasuredWidth();
        const oldOriginY = item.originY * item.getMeasuredHeight();

        item.translateX += (oldOriginX - newOriginX) * (1 - item.scaleX);
        item.translateY += (oldOriginY - newOriginY) * (1 - item.scaleY);

        item.originX = newOriginX / item.getMeasuredWidth();
        item.originY = newOriginY / item.getMeasuredHeight();

        startScale = item.scaleX;
    }

    else if (args.scale && args.scale !== 1) {
        let newScale = startScale * args.scale;
        newScale = Math.min(8, newScale);
        newScale = Math.max(0.125, newScale);

        item.scaleX = newScale;
        item.scaleY = newScale;
    }

    updateStatus();
}

export function onDoubleTap(args: GestureEventData) {
    console.log("DOUBLETAP");

    item.animate({
        translate: { x: 0, y: 0 },
        scale: { x: 1, y: 1 },
        curve: "easeOut",
        duration: 300
    }).then(function () {
        updateStatus();
    });

    updateStatus();
}

function updateStatus() {
    const text = "translate: [" + Math.round(item.translateX) + ", " + Math.round(item.translateY) + "]" +
        "\nscale: [" + (Math.round(item.scaleX * 100) / 100) + ", " + (Math.round(item.scaleY * 100) / 100) + "]" +
        "\norigin: [" + Math.round(item.originX * item.getMeasuredWidth()) + ", " + Math.round(item.originY * item.getMeasuredHeight()) + "]";

    statusLbl.text = text;
}
