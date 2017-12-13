import React from 'react';
import { Component } from 'react';

import { Animated, Easing, Image, Dimensions, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Header, List, ListItem } from 'react-native-elements'; 

import LocalStorage from '../storage/LocalStorage';
import SortableList from 'react-native-sortable-list';

const window = Dimensions.get('window');

export class ReorderPlayersScreen extends React.Component {
    //This removes the react-navigation header
    static navigationOptions = {
        title: 'Home',
        headerLeft : null,
        header: null
    };

    constructor(props) {
        super(props)

        this.state = {
            playersSelected : props.navigation.state.params.playersSelected,
            team: props.navigation.state.params.team,
            fromLineDetailScreen: props.navigation.state.params.fromLineDetailScreen,
            lineName: props.navigation.state.params.lineName,
            order: []
        }

        this.state.data = this.convertPlayersSelected()
        this.state.LocalStorage = new LocalStorage()
    }

    _renderRow = ({data, active}) => {
        return <Row data={data} active={active} />
    }

    render() {
        return (
        <View style={{flex : 1}}>
            <Header
                outerContainerStyles={{ backgroundColor: '#3D6DCC', zIndex: 1 }}
                leftComponent={{
                    icon: 'arrow-back',
                    color: '#fff',
                    onPress: () => this.props.navigation.goBack(),
                }}
                centerComponent={{ text: 'Reorder Players', style: { color: '#fff', fontSize:20 } }} 
            />
           
           {this.state.data && 
                <SortableList
                    style={styles.list}
                    contentContainerStyle={styles.contentContainer}
                    data={this.state.data}
                    renderRow={this._renderRow}
                    onChangeOrder={(newOrder) => {this.updateOrder(newOrder)}}
                    />
           }

            <View style={{marginTop: 10}}>
                <Button
                    raised
                    buttonStyle={[{backgroundColor: '#02968A'}]}
                    textStyle={{textAlign: 'center'}}
                    title={`Save`}
                    onPress={() => this.saveLine()}
                />
            </View>
        </View>
        );
    }

    updateOrder(newOrder) {
        this.setState({order : newOrder})
    }

    convertPlayersSelected(playersSelected) {
        var playersSelected = this.state.playersSelected.slice(),
            convertedPlayersSelected = {}

        playersSelected.forEach((player, index) => {
            convertedPlayersSelected[index.toString()]= {
                text: player
            }
        })

        return convertedPlayersSelected
    }

    saveLine() {
        let order = this.state.order.slice(),
            playersSelected = this.state.data
            reorderedPlayers = []

        order.forEach((playerIndex) => {
            reorderedPlayers.push(playersSelected[playerIndex].text)
        })

        let currentTeam = Object.assign({}, this.state.team)

        let sameIndex = -1,
            error = false

        currentTeam.lines.forEach((line, i) => {
            if (this.state.lineName === line.name) {
                if (this.state.fromLineDetailScreen) {
                    sameIndex = i
                }
                else {
                    error = true
                    this.setState({sameNameError : true})
                }
            }
        })
        
        //Checking if updating line order or updating players on team
        if (!this.state.fromLineDetailScreen) {
            currentTeam.players = reorderedPlayers
            this.state.LocalStorage.setTeam(currentTeam.name, currentTeam)
            this.props.navigation.navigate('ViewTeam', {currentTeamName : currentTeam.name, fromHomeScreen: false})
        }
        else if (this.state.fromLineDetailScreen) {
            currentTeam.lines[sameIndex] = {name : this.state.lineName, players: reorderedPlayers}     
            this.state.LocalStorage.setTeam(currentTeam.name, currentTeam)
            this.props.navigation.navigate('ViewLines', {currentTeamName : currentTeam.name, fromHomeScreen: false})
        }
    }
}

class Row extends Component {
    
      constructor(props) {
        super(props);
    
        this._active = new Animated.Value(0);
    
        this._style = {
          ...Platform.select({
            ios: {
              transform: [{
                scale: this._active.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1],
                }),
              }],
              shadowRadius: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 10],
              }),
            },
    
            android: {
              transform: [{
                scale: this._active.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.07],
                }),
              }],
              elevation: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [2, 6],
              }),
            },
          })
        };
      }
    
      componentWillReceiveProps(nextProps) {
        if (this.props.active !== nextProps.active) {
          Animated.timing(this._active, {
            duration: 300,
            easing: Easing.bounce,
            toValue: Number(nextProps.active),
          }).start();
        }
      }
    
      render() {
       const {data, active} = this.props;
    
        return (
          <Animated.View >
            <ListItem
                key={data}
                title={data.text}
                hideChevron={true}
            />
          </Animated.View>
        );
      }
    }

const styles = StyleSheet.create({
    halfWidth: {
        flex: .5
    },
    button: {
        borderRadius: 10,
        marginBottom: 10
    },
    title: {
        fontSize: 20,
        paddingVertical: 20,
        color: '#999999',
      },
    
      list: {
        flex: 1,
      },
    
      contentContainer: {
        width: window.width,
    
        ...Platform.select({
          ios: {
            paddingHorizontal: 30,
          },
    
          android: {
            paddingHorizontal: 0,
          }
        })
      },
      text: {
        fontSize: 24,
        color: '#222222',
      },
});
