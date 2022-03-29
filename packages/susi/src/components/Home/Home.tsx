import React from 'react';
import { View, Text } from 'react-native';
import Navigation from '../Navigation';
import tw from 'twrnc';

const Home: React.FC = () => {
    return (
        <Navigation>
            <View style={tw`flex justify-center content-center px-4`}>
                <Text style={tw`text-center text-white`}>
                    Home
                </Text>
            </View>
        </Navigation>
    );
};

export default Home;