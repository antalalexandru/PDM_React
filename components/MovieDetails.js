import React from 'react';

import {
    Text,
    View,
    StyleSheet,
    ScrollView,
    Button,
    ActivityIndicator,
    AsyncStorage,
    Animated,
    Easing
} from 'react-native';

import {withNavigation} from "react-navigation";

import AuthenticationForm from './AuthenticationForm';
import {USER_KEY} from "../utils/SessionManagement";
import {BASE_URL} from "../utils/Api";

class MovieDetails extends React.Component {

    static navigationOptions = {
        title: 'Movie details',
    };

    constructor(props) {
        super(props);

        this.spinValue = new Animated.Value(0);
        this.movieId = this.props.navigation.getParam('movieId', -1);
        this.state = {
            movieTitle: props.title,
            tableData: [],
            deletedMovie: false,
            movieDetails: {},
        };
    }

    deleteMovie = () => {
        console.log("Stergere filme", this.state.movieDetails.id);

        this.setState({
            isLoading: true
        });

        AsyncStorage.getItem(USER_KEY).then((token) => {
            if(token != null) {
                fetch(BASE_URL + '/movie/' + this.state.movieDetails.id, {
                    method: 'DELETE',
                    headers: {
                        "Authorization": token
                    }
                }).then((res) =>{
                    this.setState({
                        isLoading: false,
                        deletedMovie: true
                    });
                    this.props.navigation.replace('MoviesList');
                });
            }
            else {
                this.props.navigation.replace('AuthenticationForm');
            }
        });
    };

    componentDidMount() {

        this.spin();

        AsyncStorage.getItem(USER_KEY).then((token) => {
            if(token != null) {
                fetch(BASE_URL + '/movie/' + this.movieId, {
                    timeout: 3,
                    headers: {
                        "Authorization": token
                    }
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        this.setState({
                            movieDetails: responseJson,
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            else {
                this.props.navigation.replace('AuthenticationForm');
            }
        });
    }

    spin () {
        this.spinValue.setValue(0);
        Animated.timing(
            this.spinValue,
            {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear
            }
        ).start(() => {
        })
    }

    render() {
        const state = this.state;

        if(this.state.isLoading){
            return(
                <View style={{flex: 1, padding: 20}}>
                    <ActivityIndicator/>
                </View>
            )
        }

        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return (
            <ScrollView>
                <Text style={{fontSize: 35, padding: 20}}>{state.movieDetails.title + " (" + state.movieDetails.year + ")"}</Text>
                {state.movieDetails.image != null && (
                    <Animated.Image source={{uri: state.movieDetails.image}} style={{
                        height: 350,
                        resizeMode: 'contain',
                        transform: [{rotate: spin}]
                    }}/>
                )}
                <Text style={{fontSize: 15, padding: 10, borderBottomColor: '#bcbcbc', borderBottomWidth: 1}}>Score: {state.movieDetails.score} out of 10</Text>
                <Text style={{fontSize: 15, padding: 10, borderBottomColor: '#bcbcbc'}}>{state.movieDetails.details}</Text>

                <View style={styles.deleteMovieButton}>
                    <Button onPress={this.deleteMovie} title="Delete movie" color="#cc0000" />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    text: {
    },

    deleteMovieButton: {
        padding: 10,
        fontSize: 50,
        textAlign: 'center',
    }

});

export default withNavigation(MovieDetails);
