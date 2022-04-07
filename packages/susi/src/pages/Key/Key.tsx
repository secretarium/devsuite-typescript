import React from 'react';
import { View, Text } from 'react-native';
import { useParams } from 'react-router';
import { Container } from '../../components';
import tw from 'twrnc';

type KeyParams = {
    id: string;
};

const Key: React.FC = () => {

    const params = useParams<KeyParams>();

    return (
        <Container>
            <View style={tw`px-4`}>
                <Text style={tw`text-center text-black`}>
                    My Key {params.id}
                </Text>
            </View>
        </Container>
    );
};

export default Key;