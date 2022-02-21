import React from 'react';
import { View, Text } from 'react-native';
import Container from '../Container';
import tw from 'twrnc';

const Settings: React.FC = () => {
    return (
        <Container>
            <View style={tw`px-4`}>
                <Text style={tw`text-center text-white`}>
                    Settings
                </Text>
            </View>
        </Container>
    );
};

export default Settings;