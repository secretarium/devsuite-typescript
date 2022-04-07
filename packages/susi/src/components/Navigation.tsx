import React from 'react';
import { View, Text } from 'react-native';
import { Link } from '../router/Router';
import { Container } from './';
import tw from 'twrnc';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';

type NavigationProps = {
    showBottomNav?: boolean;
    showTopNav?: boolean;
    goBackRoute?: string;
};

export const Navigation: React.FC<NavigationProps> = ({
    showTopNav = false,
    showBottomNav = true,
    goBackRoute,
    children
}) => {

    return (
        <Container>
            <View>
                {showTopNav
                    ?
                    <View style={tw`flex-row justify-between mx-auto w-7/8`}>
                        <Link to={`${goBackRoute}`} style={tw``} underlayColor="transparent">
                            <Ionicons name="arrow-back" size={32} color="black" />
                        </Link>
                        <Link to={'..'} style={tw``} underlayColor="transparent">
                            <FontAwesome5 name="key" size={24} color="black" />
                        </Link>
                        <Link to={'../settings'} style={tw``} underlayColor="transparent">
                            <Ionicons name="settings" size={32} color="black" />
                        </Link>
                    </View>
                    :
                    <View>
                        <Text style={[tw`text-white text-3xl mx-auto`, { fontFamily: 'MuktaMaheeBold'}]}>Secretarium</Text>
                    </View>}
            </View>
            <View style={tw`flex-1 justify-center`}>{children}</View>
            <View style={tw`px-4`}>
                {showBottomNav
                    ?
                    <View style={tw`flex-row justify-around w-full bg-white p-4 rounded-3xl shadow-xl`}>
                        <Link to={'scanner'} style={tw``} underlayColor="transparent">
                            <FontAwesome name="qrcode" size={32} color="black" />
                        </Link>
                        <Link to={'settings'} style={tw``} underlayColor="transparent">
                            <Ionicons name="settings" size={32} color="black" />
                        </Link>
                    </View>
                    : null}
            </View>
        </Container>
    );
};