import React from 'react';

import {Text, StyleSheet, Button, Keyboard, ScrollView} from 'react-native';

import t from 'tcomb-form-native';
import {onSignIn} from "../utils/SessionManagement";
import {BASE_URL} from "../utils/Api";

const Form = t.form.Form;

const UserLoginData = t.struct({
    username: t.String,
    password: t.String
});

export default class AuthenticationForm extends React.Component {

    static navigationOptions = {
        title: 'Login Form',
    };

    constructor(props) {
        super(props);
        this.state = {
            errorMessage: ''
        };
    }

    handleSubmit = () => {

        Keyboard.dismiss();

        const userData = this._form.getValue();

        if(userData != null) {
            fetch(BASE_URL + '/member/login', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userData.username,
                    password: userData.password
                })
            }).then(response => {
                console.log(response);
                if(response.status !== 200) {
                    throw "Invalid credentials";
                }
                return response.text();
            })
                .then((responseJson) => {
                    onSignIn(responseJson);
                    this.props.navigation.replace('MoviesList');
                }).catch(function(error) {
                    console.log(error);
                    this.setState({
                        errorMessage: 'Invalid credentials'
                    });
                }.bind(this));
        }

    };

    render() {
        let options = {
            fields: {
                password: {
                    password: true,
                    secureTextEntry: true
                }
            }
        };

        const state = this.state;

        return (
            <ScrollView style={styles.container}>
                <Text style={styles.errorText}>{this.state.errorMessage}</Text>
                <Form
                    ref={c => this._form = c}
                    type={UserLoginData}
                    options={options}
                />
                <Button
                    title="Log in!"
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
    errorText: {
        color: '#cc0000',
        textAlign: 'center',
    }
});