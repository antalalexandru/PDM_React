import React from 'react';

import {createStackNavigator, createAppContainer} from 'react-navigation';

import MoviesList from './components/MoviesList';
import MovieDetails from './components/MovieDetails';
import AddMovieForm from './components/AddMovieForm';
import AuthenticationForm from './components/AuthenticationForm';

ErrorUtils.setGlobalHandler(function() {
// your handler here
});

const MainNavigator  = createStackNavigator({
    MoviesList: {screen: MoviesList},
    MovieDetails: {screen: MovieDetails},
    AddMovieForm: {screen: AddMovieForm},
    AuthenticationForm: {screen: AuthenticationForm},
});

const App = createAppContainer(MainNavigator);

export default App;
