import React from 'react';
import { View } from 'react-native';
import { Link } from '../../router/Router';
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
    children }) => {
    return (
        <Container>
            {showTopNav
                ? <View style={tw`absolute inset-x-0 top-0`}>
                    <View style={tw`flex-row justify-around pt-14 w-full`}>
                        <Link to={`${goBackRoute}`} style={tw``}>
                            <Ionicons name="arrow-back" size={32} color="black" />
                        </Link>
                        <Link to={'/'} style={tw``}>
                            <FontAwesome5 name="key" size={24} color="black" />
                        </Link>
                        <Link to={'/settings'} style={tw``}>
                            <Ionicons name="settings" size={32} color="black" />
                        </Link>
                    </View>
                </View>
                : null}
            {children}
            {showBottomNav
                ? <View style={tw`absolute inset-x-0 bottom-0`}>
                    <View style={tw`flex-row justify-around pb-8 w-full`}>
                        <Link to={'/scanner'} style={tw``}>
                            <FontAwesome name="qrcode" size={32} color="black" />
                        </Link>
                        <Link to={'/settings'} style={tw``}>
                            <Ionicons name="settings" size={32} color="black" />
                        </Link>
                    </View>
                </View>
                : null}
        </Container>
    );
};

export default Navigation;