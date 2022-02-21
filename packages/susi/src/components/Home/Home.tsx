import React from 'react';
import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Container from '../Container';
import tw from 'twrnc';

type RootStackParamList = {
    Home: undefined;
    Settings: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

const Home: React.FC<Props> = ({ navigation }) => {
    return (
        <Container>
            <View style={tw`flex justify-center content-center px-4`}>
                <Text style={tw`text-center text-white`}>
                    Home
                </Text>
                <Button
                    title="Go to Settings"
                    onPress={() => navigation.navigate('Settings')}
                />
            </View>
        </Container>
    );
};

export default Home;