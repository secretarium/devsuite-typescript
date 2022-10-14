import React from 'react';
import { View, Text } from 'react-native';
import { useRecoilValue } from 'recoil';
import { useParams } from '../../router/Router';
import { Navigation } from '../../components';
import { themeState } from '../../state';
import tw from 'twrnc';

type KeyParams = {
    id: string;
};

const Key: React.FC = () => {

    const params = useParams<KeyParams>();
    const { tertiaryColor } = useRecoilValue(themeState);

    return (
        <Navigation showBottomNav={false} showTopNav={true} goBackRoute="..">
            <View style={tw`px-4`}>
                <Text style={tw`text-center text-[${tertiaryColor}]`}>
                    My Key {params.id}
                </Text>
            </View>
        </Navigation>
    );
};

export default Key;