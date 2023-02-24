import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  NativeModules,
  Alert,
  NativeEventEmitter,
  Platform,
} from 'react-native';
const {PostNFC} = NativeModules;
import {NFCModule} from 'nfc_module';
const NFCEvent = new NativeEventEmitter(NativeModules.NFCModule);

const Test = () => {
  const [tokenNFC, setTokenNFC] = useState('');
  useEffect(() => {
    getTokenNFC(); // nên gọi khi khởi tạo ứng dụng

    NFCEvent.addListener('NFCNotAvailable', data => {
      console.log('NFCNotAvailable', data);
    });
    NFCEvent.addListener('NFCSuccess', data => {
      console.log('NFCSuccess', data);
    });
    NFCEvent.addListener('NFCFail', data => {
      console.log('NFCFail', data);

      Alert.alert(
        'Thông báo',
        " 'CCCD dùng cho xác thực NFC không đúng. Vui lòng thực hiện lại'",
      );
    });
    NFCEvent.addListener('VerifySuccess', data => {
      let dataJSON = JSON.parse(data.data);

      if (dataJSON?.['hash-check']) {
        console.log('dataJSON::: ', dataJSON);
      } else {
        Alert.alert('Thông báo', dataJSON?.message);
      }
    });
    NFCEvent.addListener('VerifyFail', data => {
      console.log('VerifyFail', data);
    });
  }, []);

  const getTokenNFC = async () => {
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append(
      'Cookie',
      'e89ec0957bd873206bb6ff40c1561be7=1c85f710058fe7d0bfdebea0be8fcff6',
    );

    var raw = JSON.stringify({
      token:
        'd2JIUzVYTm83V1A5YUFsbV9fU3V6Y1Q4UjFFYTpmdnVHclFJM29VcVpNR2Y0RTcyX2UwQnFKWGth',
      username: 'scbtest',
      password: 'scb@2022',
    });

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    return fetch(
      'https://apig.idcheck.xplat.online/api-security/v1/api-gateway/login',
      requestOptions,
    )
      .then(response => response.json())
      .then(result => {
        console.log('result:::: ', result);
        if (result && result?.status == 200 && result?.accessToken) {
          setTokenNFC(result?.accessToken);
        } else {
          Alert.alert('Thông báo', result?.message);
        }
      })
      .catch(error => console.log('error', error));
  };

  const checkAndroid = () => {
    PostNFC.checkNFC(
      tokenNFC, // token NFC
      '060098008677', // số CCCD
      'Hướng dẫn xác thực CCCD gắn chip', // Title
      true, // check BCD
      'vi', // ngôn ngữ
      'Sẵn sàng quét', // text hiển thị trên bottomsheet
      'Hủy', // text button
      'Giữ nguyên vị trí của căn cước công dân', // text hiển thị trên bottomsheet
      'Giữ thiết bị gần căn cước công dân', // text hiển thị trên bottomsheet
      'Xác thực', // text hiển thị trên bottomsheet
      'Thiết bị hỗ trợ', // text hiển thị trên bottomsheet
      valueSuccess => {
        // Nhận gía trị trả về khi nfc thành công
        console.log('value::::: ', valueSuccess);
      },
      valueError => {
        // Nhận gía trị trả về khi nfc thất bại
        console.log('error::::: ', valueError);
      },
    );
  };
  const checkIOS = () => {
    NFCModule.showNFC(
      'https://apig.idcheck.xplat.online/real-id/v1/api-gateway/check-nfc-objdg', //urrl
      tokenNFC, //tokenNFC
      'vi', //language
      '980914', //namSinh - format: YYMMDD
      '230914', //ngayHetHan - format: YYMMDD
      '006098008677', //soCCCD
      true, // checkBCA
    );
  };

  return (
    <View
      style={{
        backgroundColor: 'white',
        justifyContent: 'center',
        // alignItems: 'center',
        flex: 1,
      }}>
      <TouchableOpacity
        onPress={() => {
          if (Platform.OS == 'android') {
            checkAndroid();
          } else {
            checkIOS();
          }
        }}
        style={{
          backgroundColor: 'green',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 16,
          marginHorizontal: 24,
        }}>
        <Text>CheckNFC</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({
  container: {},
});
