// @flow
import React from 'react';
import {
  View,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
  FlatList,
  ScrollView
} from 'react-native';
import { withNavigationFocus } from 'react-navigation';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CheckIcon from 'react-native-vector-icons/Octicons';
import CloseIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcon from 'react-native-vector-icons/Feather';
import LocationPin from 'react-native-vector-icons/Entypo';
import I18n from 'react-native-i18n';
import type { Category } from '../../../types/category';
import type { Observation } from '../../../types/observation';
import CategoryPin from '../../../images/category-pin.png';
import PencilIcon from '../../../images/editor-details.png';
import {
  LIGHT_GREY,
  WHITE,
  MANGO,
  MEDIUM_GREY,
  VERY_LIGHT_BLUE
} from '../../../lib/styles';

export type StateProps = {
  category?: Category,
  selectedObservation: Observation
};

export type Props = {
  isFocused: boolean,
  navigation: any
};

export type DispatchProps = {
  updateObservation: (o: Observation) => void,
  goToPhotoView: (photoSource: string) => void,
  addObservation: (o: Observation) => void,
  goToCameraView: () => void,
  goBack: () => void,
  goToTabBarNavigation: () => void
};

type State = {
  goToCamera: boolean,
  keyboardShown: boolean,
  text: string,
  textInputHeight: number,
  keyboardHeight: number
};

const styles = StyleSheet.create({
  bottomButton: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: WHITE,
    height: 60,
    borderColor: LIGHT_GREY,
    borderBottomWidth: 1
  },
  bottomButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black'
  },
  categoryAtText: {
    fontSize: 12,
    color: 'black',
    fontWeight: '400'
  },
  categoryName: {
    fontSize: 15,
    color: 'black',
    fontWeight: '600'
  },
  categoryPin: {
    width: 80,
    height: 90,
    marginTop: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryPositionText: {
    fontSize: 12,
    color: 'black',
    fontWeight: '700',
    marginLeft: 3
  },
  check: {
    backgroundColor: MANGO,
    height: 35,
    width: 35,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkOuterCircle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: '#ed6109',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkIcon: {
    alignSelf: 'center',
    marginLeft: 3
  },
  circle: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 50,
    borderColor: LIGHT_GREY,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    shadowOpacity: 1,
    marginVertical: 5
  },
  collectionsImg: {
    alignSelf: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: WHITE
  },
  greyCheck: {
    backgroundColor: LIGHT_GREY,
    height: 35,
    width: 35,
    borderRadius: 50,
    justifyContent: 'center'
  },
  greyCheckOuterCircle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d6d2cf'
  },
  mediaRow: {
    backgroundColor: WHITE,
    borderColor: LIGHT_GREY,
    borderTopWidth: 1,
    height: 85
  },
  mediaRowKeyboardShown: {
    flex: 1,
    backgroundColor: WHITE,
    borderColor: LIGHT_GREY,
    marginBottom: -20
  },
  photosButton: {
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: WHITE,
    height: 60,
    borderColor: LIGHT_GREY,
    borderBottomWidth: 1
  },
  textInput: {
    fontSize: 20,
    padding: 20,
    paddingBottom: 30,
    color: 'black',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    textAlignVertical: 'top',
    backgroundColor: 'white',
    borderColor: LIGHT_GREY
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center'
  },
  titleLong: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
    textAlign: 'center'
  },
  triangle: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(0, 0, 0, .8)',
    transform: [{ rotate: '180deg' }]
  }
});

I18n.fallbacks = true;
I18n.translations = {
  en: require('../../../translations/en'),
  es: require('../../../translations/es')
};

class ObservationEditor extends React.Component<
  Props & StateProps & DispatchProps,
  State
> {
  paddingInput: Animated.Value;
  keyboardWillShowListener: any;
  keyboardWillHideListener: any;
  keyboardDidShowListener: any;
  keyboardDidHideListener: any;
  scrollView: any;
  textInput: any;

  constructor(props: StateProps & DispatchProps) {
    super();

    this.paddingInput = new Animated.Value(0);

    this.state = {
      keyboardShown: false,
      text: props.selectedObservation ? props.selectedObservation.notes : '',
      goToCamera: false,
      textInputHeight: 0,
      keyboardHeight: 0
    };
  }

  componentWillMount() {
    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this.keyboardWillShow
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this.keyboardWillHide
    );
  }

  componentDidMount() {
    const { updateObservation, selectedObservation, category } = this.props;

    if (selectedObservation && category) {
      updateObservation({
        ...selectedObservation,
        type: category.name,
        name: category.name
      });
    }

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide
    );
  }

  shouldComponentUpdate(
    nextProps: Props & StateProps & DispatchProps,
    nextState: State
  ) {
    if (nextProps.isFocused) {
      return nextProps !== this.props || nextState !== this.state;
    }

    return false;
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  keyboardWillShow = e => {
    Animated.timing(this.paddingInput, {
      duration: e.duration,
      toValue: 60
    }).start();
  };

  keyboardWillHide = e => {
    Animated.timing(this.paddingInput, {
      duration: e.duration,
      toValue: 0
    }).start();
  };

  keyboardDidShow = e => {
    this.setState(previousState => ({
      goToCamera: false,
      keyboardShown: true,
      text: previousState.text,
      keyboardHeight: e.endCoordinates.height
    }));
  };

  keyboardDidHide = () => {
    if (this.state.goToCamera) {
      this.setState(previousState => ({
        goToCamera: false,
        keyboardShown: false,
        text: previousState.text
      }));
      this.props.goToCameraView();
    } else {
      this.setState(previousState => ({
        goToCamera: previousState.goToCamera,
        keyboardShown: false,
        text: previousState.text
      }));
    }
  };

  handleTextInputChange = text => {
    this.setState({ text });
  };

  handleTextInputScroll = ({ nativeEvent: event }) => {
    this.setState({ textInputHeight: event.contentSize.height });
  };

  handleSaveObservation = () => {
    const {
      addObservation,
      selectedObservation,
      goToTabBarNavigation
    } = this.props;
    const { text } = this.state;

    if (selectedObservation) {
      addObservation({
        ...selectedObservation,
        notes: text
      });
    }

    goToTabBarNavigation();
  };

  handleTextInputBlur = () => {
    const { selectedObservation, updateObservation } = this.props;

    if (selectedObservation) {
      updateObservation({
        ...selectedObservation,
        notes: this.state.text
      });
    }
  };

  goToCameraView = () => {
    const {
      selectedObservation,
      updateObservation,
      goToCameraView
    } = this.props;

    if (selectedObservation) {
      updateObservation({
        ...selectedObservation,
        notes: this.state.text
      });
    }
    if (this.state.keyboardShown) {
      this.setState(previousState => ({
        goToCamera: true,
        keyboardShown: false,
        text: previousState.text
      }));
    } else {
      goToCameraView();
    }
    Keyboard.dismiss();
  };

  render() {
    const {
      navigation,
      goBack,
      selectedObservation,
      goToPhotoView
    } = this.props;
    const { keyboardShown, text } = this.state;
    const positionText = selectedObservation
      ? `${selectedObservation.lat}, ${selectedObservation.lon}`
      : 'Loading...';
    const keyExtractor = item => item.source;
    const showGreyCheck =
      text === '' && selectedObservation && !selectedObservation.media.length;

    if (!selectedObservation) {
      goBack();
      return <View />;
    }

    return (
      <KeyboardAvoidingView style={styles.container}>
        <View
          style={{
            backgroundColor: VERY_LIGHT_BLUE,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 10,
            height: 65
          }}
        >
          <TouchableOpacity
            style={{
              paddingLeft: 10,
              width: 70,
              position: 'absolute',
              top: 25,
              left: 20
            }}
            underlayColor="rgba(0, 0, 0, 0.5)"
            onPress={goBack}
          >
            <CloseIcon color="#9E9C9C" name="window-close" size={25} />
          </TouchableOpacity>
          <View style={{ marginTop: 6 }}>
            <View
              style={{
                height: 35,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, .8)',
                borderRadius: 50,
                paddingLeft: 13,
                paddingRight: 15
              }}
            >
              <View
                style={{
                  backgroundColor: '#7AFA4C',
                  height: 10,
                  width: 10,
                  borderRadius: 50
                }}
              />
              <Text style={{ color: WHITE, marginHorizontal: 20 }}>
                {`+/- 100m`}
              </Text>
            </View>
            <View style={styles.triangle} />
          </View>
          {showGreyCheck && (
            <View style={styles.greyCheckOuterCircle}>
              <View style={styles.greyCheck}>
                <CheckIcon
                  color="white"
                  name="check"
                  size={18}
                  style={styles.checkIcon}
                />
              </View>
            </View>
          )}
          {!showGreyCheck && (
            <TouchableOpacity
              style={styles.checkOuterCircle}
              onPress={this.handleSaveObservation}
            >
              <View style={styles.check}>
                <CheckIcon
                  color="white"
                  name="check"
                  size={18}
                  style={styles.checkIcon}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
            backgroundColor: VERY_LIGHT_BLUE
          }}
        >
          <View style={styles.circle}>{selectedObservation.icon}</View>
          <View style={{ marginTop: 5, flexDirection: 'row' }}>
            <LocationPin color={MANGO} name="location-pin" size={15} />
            <Text style={styles.categoryPositionText}>{positionText}</Text>
          </View>
        </View>
        <ScrollView ref={ref => (this.scrollView = ref)}>
          <TextInput
            ref={ref => (this.textInput = ref)}
            style={[styles.textInput]}
            value={text}
            onChangeText={this.handleTextInputChange}
            onContentSizeChange={this.handleTextInputScroll}
            onFocus={() => this.scrollView.scrollToEnd()}
            placeholder={I18n.t('editor.placeholder')}
            placeholderTextColor="silver"
            underlineColorAndroid="transparent"
            onBlur={this.handleTextInputBlur}
            multiline
            autoGrow
            autoFocus
          />
        </ScrollView>
        {selectedObservation &&
          !!selectedObservation.media.length && (
            <View
              style={
                keyboardShown ? styles.mediaRowKeyboardShown : styles.mediaRow
              }
            >
              <FlatList
                horizontal
                scrollEnabled
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  paddingTop: 10
                }}
                contentContainerStyle={{
                  alignContent: 'flex-start'
                }}
                keyExtractor={keyExtractor}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => goToPhotoView(item.source)}
                    style={{ paddingLeft: 10 }}
                  >
                    <Image
                      source={{ uri: item.source }}
                      style={{
                        width: 65,
                        height: 65,
                        borderRadius: 5
                      }}
                    />
                  </TouchableOpacity>
                )}
                data={selectedObservation.media}
              />
            </View>
          )}
        <View
          style={{
            borderTopWidth: 1,
            borderColor: LIGHT_GREY
          }}
        >
          {keyboardShown && (
            <Animated.View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-around',
                backgroundColor: 'white',
                marginBottom: this.state.keyboardHeight,
                height: 55
              }}
            >
              <TouchableOpacity
                onPress={this.goToCameraView}
                underlayColor="transparent"
              >
                <Icon color={MEDIUM_GREY} name="photo-camera" size={30} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Image source={PencilIcon} style={{ width: 25, height: 25 }} />
              </TouchableOpacity>
            </Animated.View>
          )}
          {!keyboardShown && (
            <View>
              <TouchableOpacity
                style={styles.photosButton}
                onPress={this.goToCameraView}
                underlayColor="transparent"
              >
                <View style={{ flexDirection: 'row' }}>
                  <Icon
                    color={MEDIUM_GREY}
                    name="photo-camera"
                    size={30}
                    style={{ marginHorizontal: 30 }}
                  />
                  <Text style={styles.bottomButtonText}>
                    {I18n.t('editor.media_button')}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bottomButton}>
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    source={PencilIcon}
                    style={{
                      marginLeft: 34,
                      marginRight: 31,
                      width: 25,
                      height: 25
                    }}
                  />
                  <Text style={styles.bottomButtonText}>
                    {I18n.t('editor.details_button')}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

export default withNavigationFocus(ObservationEditor);
