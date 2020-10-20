import { DeviceEventEmitter, View } from 'react-native'
import Beacons from 'react-native-beacons-manager'
import React, { Component } from 'react';
import { Text, PermissionsAndroid, Dimensions } from 'react-native';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      windowWidth: 0,
      windowHeight: 0,
      beacon0: "nothing",
      beacon1: "nothing",
      beacon2: "nothing",
      beacon3: "nothing",
      beacon01: "nothing",
      beacon23: "nothing",
      ratio01: 0,
      ratio23: 0,
      ratio1: 0,
      ratio2: 0,
    }
  }

  setBeacons = (beacons) => {
    this.setState({ beacon: beacons });
  }

  requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Cool Photo App Camera Permission",
          message:
            "Cool Photo App needs access to your camera " +
            "so you can take awesome pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  //.startRangingBeaconsInRegion('Ibeacon', '74278bda-b644-4520-8f0c-720eaf059935') 
  componentDidMount() {

    _windowWidth = Dimensions.get('window').width;
    _windowHeight = Dimensions.get('window').height;
    this.setState({ windowHeight: _windowHeight, windowWidth: _windowWidth });

    this.requestCameraPermission();
    Beacons.detectIBeacons();
    Beacons
      .startRangingBeaconsInRegion('Estimotes', '74278bda-b644-4520-8f0c-720eaf059935') // or like  < v1.0.7: .startRangingBeaconsInRegion(identifier, uuid)
      .then(() => console.log('Beacons ranging started succesfully'))
      .catch(error => console.log(`Beacons ranging not started, error: ${error}`));


    var subscription = DeviceEventEmitter.addListener(
      'beaconsDidRange',
      (data) => {
        for (var i = 0; i < data.beacons.length; i++) {
          switch (data.beacons[i].minor) {
            case 64000:
              this.setState({ beacon0: data.beacons[i].distance });
            case 64001:
              this.setState({ beacon1: data.beacons[i].distance });
            case 64002:
              this.setState({ beacon2: data.beacons[i].distance });
            case 64003:
              this.setState({ beacon3: data.beacons[i].distance });

          }
        }

        if (data.beacons.length > 3) {
          let ave01 = (data.beacons[0].distance + data.beacons[1].distance) / 2;
          let ave23 = (data.beacons[2].distance + data.beacons[3].distance) / 2;
          this.setState({ beacon01: ave01, beacon23: ave23 });

          let rat01 = parseInt((ave01 / (ave01 + ave23)) * this.state.windowWidth);
          let rat23 = parseInt((ave23 / (ave01 + ave23)) * this.state.windowWidth);
          this.setState({ ratio01: rat01, ratio23: rat23 });

          let rat1 = parseInt((ave01 / (ave01 + ave23)) * this.state.windowWidth);
          let rat2 = parseInt((ave23 / (ave01 + ave23)) * this.state.windowWidth);
          this.setState({ ratio01: rat01, ratio23: rat23 });


        }

        // data.region - The current region
        // data.region.identifier
        // data.region.uuid

        // data.beacons - Array of all beacons inside a region
        //	in the following structure:
        //	  .uuid
        //	  .major - The major version of a beacon
        //	  .minor - The minor version of a beacon
        //	  .rssi - Signal strength: RSSI value (between -100 and 0)
        // 	  .proximity - Proximity value, can either be "unknown", "far", "near" or "immediate"
        //	  .accuracy - The accuracy of a beacon
      }
    );
  }


  componentWillUnMount() {
    this.stopRangingAndMonitoring();
    // remove monitiring events we registered at componentDidMount::
    this.beaconsDidEnterEvent.remove();
    this.beaconsDidLeaveEvent.remove();
    // remove ranging event we registered at componentDidMount:
    this.beaconsDidRangeEvent.remove();
  }


  drawSquare = (_w, color) => {
    return (
      <View style={{ width: _w, height: 100, backgroundColor: color }} />
    )
  }


  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'space-around', }}>
        <Text>
          Beacon 0: {this.state.beacon0}
        </Text>
        <Text>
          Beacon 1: {this.state.beacon1}
        </Text>
        <Text>
          Beacon 2: {this.state.beacon2}
        </Text>
        <Text>
          Beacon 3: {this.state.beacon3}
        </Text>
        <Text>
          Beacon 01Average: {this.state.beacon01}
        </Text>
        <Text>
          Beacon 23Average: {this.state.beacon23}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row' }} >
          {this.drawSquare(parseInt(this.state.ratio01), 'blue')}
          {this.drawSquare(parseInt(this.state.ratio23), 'green')}
        </View>
      </View>
    );
  }
}

export default App;
