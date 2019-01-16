import React from 'react';

import {
    Text,
    View,
    StyleSheet,
    Image,
    ImageBackground,
    Button,
    Keyboard,
    ScrollView,
    ActivityIndicator,
    AsyncStorage
} from 'react-native';

import t from 'tcomb-form-native';
import {USER_KEY} from "../utils/SessionManagement";
import {BASE_URL} from "../utils/Api";

const Form = t.form.Form;

const Score = t.enums.of([
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
], 'Score');

const Movie = t.struct({
    title: t.String,
    year: t.String,
    score: Score,
    details: t.maybe(t.String),
    image: t.maybe(t.String)
});

export default class AddMovieForm extends React.Component {

    static navigationOptions = {
        title: 'Add movie',
    };

    constructor(props) {
        super(props);
        this.state = {
            scoreHasError: false,
            scoreErrorMessage: '',
            imageHasError: false,
            imageErrorMessage: '',
        };
    }

    handleSubmit = () => {

        Keyboard.dismiss();

        const movie = this._form.getValue();

        if(movie != null) {
            let ok = true;
            if (movie.score != null && (movie.score < 0 || movie.score > 10)) {
                this.setState({
                    scoreHasError: true,
                    scoreErrorMessage: "Score is not in range [1, 10]"
                });
                ok = false;
            }
            if (movie.year != null && (movie.year < 0 )) {
                ok = false;
            }
            if(movie.image != null && movie.image.match() == null) {
                this.setState({
                    imageHasError: true,
                    imageErrorMessage: "Image URL is invalid"
                });
            }
            if(ok) {
                // ok
                console.log(movie);

                this.setState({
                    isLoading: true
                });

                AsyncStorage.getItem(USER_KEY).then((token) => {
                    if(token != null) {
                        fetch(BASE_URL + '/movie', {
                            method: 'POST',
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                "Authorization": token
                            },
                            body: JSON.stringify({
                                title: movie.title,
                                score: movie.score,
                                year: movie.year,
                                details: movie.details,
                                image: movie.image
                            })
                        }).then((response) => response.json())
                            .then((res) =>{
                                this.setState({
                                    isLoading: false
                                });
                                this.props.navigation.replace('MovieDetails', {
                                    movieTitle: res.title,
                                    movieId: res.id
                                });
                            });
                    }
                    else {
                        this.props.navigation.replace('AuthenticationForm');
                    }
                });
            }
        }

    };

    render() {

        let options = {
            fields: {
                title: {
                    label: 'Movie Title',
                },
                year: {
                    lavel: 'Year',
                },
                score: {
                    label: 'Score (out of 10)',
                    hasError: this.state.scoreHasError,
                    error: this.state.scoreErrorMessage
                },
                image: {
                    label: 'Image URL',
                    hasError: this.state.imageHasError,
                    error: this.state.imageErrorMessage
                },

                details: {
                    multiline: true,
                    stylesheet: {
                        ...Form.stylesheet,
                        textbox: {
                            ...Form.stylesheet.textbox,
                            normal: {
                                ...Form.stylesheet.textbox.normal,
                                height: 100,
                                textAlignVertical: 'top',
                            },
                            error: {
                                ...Form.stylesheet.textbox.error,
                                height: 100
                            }
                        }
                    }
                }
            },
        };

        const state = this.state;

        if(this.state.isLoading){
            return(
                <View style={{flex: 1, padding: 20}}>
                    <ActivityIndicator/>
                </View>
            )
        }

        return (
            <ScrollView style={styles.container}>
                <Form
                    ref={c => this._form = c}
                    type={Movie}
                    options={options}
                />
                <Button
                    title="Add movie!"
                    onPress={this.handleSubmit}
                    color="#bb0000"
                />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#ffffff',
    },
});