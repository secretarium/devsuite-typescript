import React, { PropsWithChildren } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

const Container: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
    return (
        <SafeAreaView style={tw`flex-1 bg-[#E6224F]`}>
            {children}
        </SafeAreaView>
    );
};

export default Container;