import {AsyncStorage} from 'react-native';

export const USER_KEY = "user_key";

export const onSignIn = (token) => AsyncStorage.setItem(USER_KEY, token);

export const onSignOut = () => AsyncStorage.removeItem(USER_KEY);

export const checkSignedIn = () => {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem(USER_KEY)
            .then(res => {
                resolve(res);
            })
            .catch(err => reject(err));
    })
};