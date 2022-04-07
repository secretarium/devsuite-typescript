import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useRecoilState } from 'recoil';
import { themeState } from '../state';

export const Container: React.FC = ({ children }) => {

    const [theme] = useRecoilState(themeState);

    return (
        <SafeAreaView style={tw`flex-1 bg-[${theme.backgroundColor}]`}>
            {children}
        </SafeAreaView>
    );
};