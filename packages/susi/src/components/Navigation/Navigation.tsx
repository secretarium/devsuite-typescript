import React from 'react';
import { View, Text } from 'react-native';
import { Link } from '../../router/Router.native';
import Container from '../Container';
import tw from 'twrnc';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';

type NavigationProps = {
    showBottomNav?: boolean;
    showTopNav?: boolean;
    goBackRoute?: string;
};

const Navigation: React.FC<NavigationProps> = ({
    showTopNav = false,
    showBottomNav = true,
    goBackRoute,
    children
}) => {

    return (
        <Container>
            <View>
                {showTopNav
                    ? <View style={tw`flex-row justify-between mx-auto w-full p-4 h-16`}>
                        <Link to={`${goBackRoute}`} style={tw``} underlayColor="transparent">
                            <Ionicons name="arrow-back" size={32} color="white" />
                        </Link>
                        <Link to={'..'} style={tw``} underlayColor="transparent">
                            <FontAwesome5 name="key" size={24} color="white" />
                        </Link>
                        <Link to={'../settings'} style={tw``} underlayColor="transparent">
                            <Ionicons name="settings" size={32} color="white" />
                        </Link>
                    </View>
                    : <View style={tw`flex-row justify-between mx-auto w-full p-4 h-16`}>
                        <Text style={tw`text-white text-3xl`}>Susi</Text>
                    </View>}
            </View>
            <View style={tw`flex-1 bg-[#F9F9F9]`}>{children}</View>
            <View>
                {showBottomNav
                    ? <View style={tw`flex-row justify-around w-full py-1`}>
                        <Link to={'scanner'} style={tw``} underlayColor="transparent">
                            <FontAwesome name="qrcode" size={32} color="white" />
                        </Link>
                        <Link to={'settings'} style={tw``} underlayColor="transparent">
                            <Ionicons name="settings" size={32} color="white" />
                        </Link>
                    </View>
                    : null}
            </View>
        </Container>
    );
};

export default Navigation;