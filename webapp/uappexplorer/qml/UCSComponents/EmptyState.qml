import QtQuick 2.0
import Ubuntu.Components 1.1

/*
 Component which displays an empty state (approved by design). It offers an
 icon, title and subtitle to describe the empty state.
*/

Item {
    id: emptyState

    // Public APIs
    property alias iconName: emptyIcon.name
    property alias iconSource: emptyIcon.source
    property alias iconColor: emptyIcon.color
    property alias title: emptyLabel.text
    property alias subTitle: emptySublabel.text

    height: childrenRect.height

    Icon {
        id: emptyIcon
        anchors.horizontalCenter: parent.horizontalCenter
        height: units.gu(10)
        width: height
        color: "#BBBBBB"
    }

    Label {
        id: emptyLabel
        anchors.top: emptyIcon.bottom
        anchors.topMargin: units.gu(5)
        anchors.horizontalCenter: parent.horizontalCenter
        fontSize: "large"
        font.bold: true
    }

    Label {
        id: emptySublabel
        anchors.top: emptyLabel.bottom
        anchors.horizontalCenter: parent.horizontalCenter
    }
}
