var abs = require("ui/layouts/absolute-layout");
var utils = require("utils/utils");

var states = ["unknown", "start", "change", "end"];

var item;
var statusLbl;

var density;

var prevDeltaX;
var prevDeltaY;
var startScale = 1

function pageLoaded(args) {
    var page = args.object;
    item = page.getViewById("item");
    statusLbl = page.getViewById("status");
    density = utils.layout.getDisplayDensity();
    
    updateStatus();
}
exports.pageLoaded = pageLoaded;

function onPan(args) {
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
exports.onPan = onPan;


function onPinch(args) {
    console.log("PINCH[" + states[args.state] + "] scale: " + args.scale + " focusX: " + args.getFocusX() + " focusY: " + args.getFocusY());

    if (args.state === 1) {
        var newOriginX = args.getFocusX() - item.translateX;
        var newOriginY = args.getFocusY() - item.translateY;

        var oldOriginX = item.originX * item.width;
        var oldOriginY = item.originY * item.height;

        item.translateX += (oldOriginX - newOriginX) * (1 - item.scaleX);
        item.translateY += (oldOriginY - newOriginY) * (1 - item.scaleY);

        item.originX = newOriginX / item.width;
        item.originY = newOriginY / item.height;

        startScale = item.scaleX;
    }

    else if (args.scale && args.scale !== 1) {
        var newScale = startScale * args.scale;

        newScale = Math.min(8, newScale);
        newScale = Math.max(0.125, newScale);

        item.scaleX = newScale;
        item.scaleY = newScale;
    }

    updateStatus();
}
exports.onPinch = onPinch;

function onDoubleTap(args) {
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
exports.onDoubleTap = onDoubleTap;

function updateStatus() {

    var text = "translate: [" + Math.round(item.translateX) + ", " + Math.round(item.translateY) + "]" +
        "\nscale: [" + (Math.round(item.scaleX * 100) / 100) + ", " + (Math.round(item.scaleY * 100) / 100) + "]" +
        "\norigin: [" + Math.round(item.originX * item.width) + ", " + Math.round(item.originY * item.height) + "]"

    statusLbl.text = text;

    //console.log(text + "");
}