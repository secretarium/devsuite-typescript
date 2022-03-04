import React from 'react';
import { Text } from 'react-native';
import Navigation from '../Navigation';
import tw from 'twrnc';

const Settings: React.FC = () => {
    return (
        <Navigation showBottomNav={false} showTopNav={true} goBackRoute="..">
            <Text style={tw`text-center text-white`}>
                Settings
            </Text>
        </Navigation>
    );
};

export default Settings;