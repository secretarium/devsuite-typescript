import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

const Container: React.FC = ({ children }) => {
    return (
        <SafeAreaView style={tw`flex-1 bg-[#E6224F] px-4`}>
            {children}
        </SafeAreaView>
    );
};

export default Container;