import React, { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { useRecoilValue } from 'recoil';
import { themeState } from '../state';
import { StatusBar } from 'expo-status-bar';

export const Container: React.FC<PropsWithChildren> = ({ children }) => {

    const { primaryColor, statusBarColor } = useRecoilValue(themeState);

    return (
        <SafeAreaView style={tw`flex-1 bg-[${primaryColor}]`}>
            <StatusBar style={statusBarColor} />
            {children}
        </SafeAreaView>
    );
};