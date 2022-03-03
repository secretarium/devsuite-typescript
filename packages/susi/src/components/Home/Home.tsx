import React from 'react';
import { View, Text } from 'react-native';
import Container from '../Container';
import tw from 'twrnc';

const Home: React.FC = () => {
    return (
        <Container>
            <View style={tw`flex justify-center content-center px-4`}>
                <Text style={tw`text-center text-white`}>
                    Home
                </Text>
            </View>
        </Container>
    );
};

export default Home;