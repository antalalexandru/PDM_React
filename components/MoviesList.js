import React from 'react';
import {Text, View, StyleSheet, Button, ActivityIndicator, ScrollView, RefreshControl, AsyncStorage} from 'react-native';

import { ListItem } from 'react-native-elements';

import MovieDetails from './MovieDetails';

import {USER_KEY} from '../utils/SessionManagement';

import { LineChart, Grid } from 'react-native-svg-charts';

import email from 'react-native-email';
import {BASE_URL, WEBSOCKET_ADDR} from "../utils/Api";


const numberOfItemsPerPage = 10;

export default class MoviesList extends React.Component {

    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        this.currentPage = this.props.navigation.getParam('pageNumber', 1);

        console.log(this.currentPage);

        this.state = {
            moviesList: [],
            isLoading: true,
            moviesCount: 0,
            numberOfMoviePages: 0,
            signedIn: false,
            moviesToShow: []
        };
    }

    handleWebSocket = () => {
        this.ws = new WebSocket(WEBSOCKET_ADDR);

        this.ws.onmessage = (e) => {
            // a message was received
            alert(e.data);
            this.loadMovies();
        };

        this.ws.onerror = (e) => {
            // an error occurred
            console.log("Websocket error, ", e.message);
        };

        this.ws.onclose = (e) => {
            // connection closed
            console.log(e.code, e.reason);
        };
    };

    loadMovies = () => {
        AsyncStorage.getItem(USER_KEY).then((token) => {
            if(token != null) {
                console.log("Got token", token);
                fetch(BASE_URL + '/movie', {
                    timeout: 3,
                    headers: {
                        "Authorization": token
                    }
                }).then((response) => {
                        if(response.status !== 200) {
                            this.props.navigation.replace('AuthenticationForm');
                        }
                        return response.json()
                    })
                    .then((responseJson) => {
                        this.showMoviesOnPage(responseJson);
                        AsyncStorage.setItem('movies_list', JSON.stringify(responseJson));
                    })
                    .catch((error) => {
                        AsyncStorage.getItem('movies_list', []).then((item) => {
                            this.showMoviesOnPage(JSON.parse(item));
                        });
                    });
            }
            else {
                this.props.navigation.replace('AuthenticationForm');
            }
        });
    };

    showMoviesOnPage = (movies) => {
        this.setState({
            moviesList: movies,
            isLoading: false,
            refreshing: false,
            moviesToShow: movies.slice((this.currentPage - 1) * numberOfItemsPerPage, (this.currentPage) * numberOfItemsPerPage),
            moviesCount: movies.length,
            numberOfMoviePages: Math.ceil(movies.length / numberOfItemsPerPage)
        });
    };

    _onRefresh = () => {
        this.setState({refreshing: true});
        this.loadMovies();
    };

    handleEmail = () => {
        const to = ['alexandru.antal@outlook.com'];
        email(to, {
            cc: [],
            bcc: '',
            subject: 'Email subject',
            body: 'Email body'
        }).catch(console.error)
    };

    componentDidMount() {
        this.loadMovies();
        this.handleWebSocket();
    }

    componentWillUnmount() {
        this.ws.close(100, 'Bye!');
    }

    render() {

        if(this.state.isLoading){
            return (
                <View style={{flex: 1, padding: 20}}>
                    <ActivityIndicator/>
                </View>
            )
        }

        // graph
        const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ];

        return (
            <ScrollView refreshControl={
                <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._onRefresh}
                />
            }>
                <Text style={styles.text}>Movies list</Text>
                <Text style={styles.moviesCountStyle}>{this.state.moviesCount} movies :)</Text>

                <View style={styles.addMovieButton}>
                    <Button onPress={() => this.props.navigation.navigate('AddMovieForm', {})} title="Add movie" />
                </View>

                <View style={styles.addMovieButton}>
                    <Button onPress={() => this.handleEmail()} title="Contact form"/>
                </View>

                <LineChart
                    style={{ height: 200 }}
                    data={ data }
                    svg={{ stroke: 'rgb(134, 65, 244)' }}
                    contentInset={{ top: 20, bottom: 20 }}
                >
                    <Grid/>
                </LineChart>

                <View style={{flexDirection: 'row', paddingLeft: 20, marginBottom: 20}}>
                    <Button disabled={this.currentPage === 1} onPress={() => {
                        this.currentPage--;
                        this.loadMovies();
                    }} title="<" />
                    <Text style={{marginTop: 10, marginLeft: 20, marginRight: 20}}>Page {this.currentPage} of {this.state.numberOfMoviePages}</Text>
                    <Button disabled={this.currentPage === this.state.numberOfMoviePages} onPress={() => {
                        this.currentPage++;
                        this.loadMovies();
                    }} title=">" />
                </View>

                {
                    this.state.moviesToShow.map((movie, i) => (
                        <ListItem
                            key={i}
                            title={movie.title + " (" + movie.year + ")"}
                            onPress={() => this.props.navigation.navigate('MovieDetails', {
                                movieTitle: movie.title,
                                movieId: movie.id
                            })}
                        />
                    ))
                }
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    text: {
        paddingTop: 50,
        paddingBottom: 20,
        fontSize: 50,
        textAlign: 'center',
    },

    notLoggedInText: {
        paddingTop: 50,
        paddingBottom: 20,
        fontSize: 30,
        textAlign: 'center',
    },

    moviesCountStyle: {
        paddingTop: 10,
        paddingBottom: 20,
        fontSize: 20,
        textAlign: 'center',
    },

    addMovieButton: {
        padding: 20,
        fontSize: 50,
        textAlign: 'center',
    }

});

