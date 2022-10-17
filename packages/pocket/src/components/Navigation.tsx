import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Link } from '../router/Router';
import { Container } from './Container';
import tw from 'twrnc';
// import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
// import { useRecoilValue } from 'recoil';
// import { themeState } from '../state/theme';

type NavigationProps = PropsWithChildren<{
    showBottomNav?: boolean;
    showTopNav?: boolean;
    goBackRoute?: string;
}>;

export const Navigation: React.FC<NavigationProps> = ({
    showTopNav = false,
    // showBottomNav = true,
    goBackRoute,
    children
}) => {

    // const { secondaryColor, tertiaryColor, appName } = useRecoilValue(themeState);

    return (
        <Container>
            <View>
                {showTopNav
                    ?
                    <View style={tw`flex-row justify-between mx-auto w-7/8`}>
                        <Link to={`${goBackRoute}`} underlayColor="transparent">
                            {/* <Ionicons name="arrow-back" size={32} color={secondaryColor} /> */}
                        </Link>
                        <Link to={'..'} underlayColor="transparent">
                            {/* <FontAwesome5 name="key" size={24} color={secondaryColor} /> */}
                        </Link>
                        <Link to={'../settings'} underlayColor="transparent">
                            {/* <Ionicons name="settings" size={32} color={secondaryColor} /> */}
                        </Link>
                    </View>
                    :
                    <View>
                        {/* <Text style={[tw`text-[${secondaryColor}] text-3xl mx-auto pt-1`, { fontFamily: 'MuktaMaheeBold' }]}>
                            {appName}
                        </Text> */}
                    </View>}
            </View>
            <View style={tw`flex-1 justify-center`}>{children}</View>
            {/* <View style={tw`px-4`}>
                {showBottomNav
                    ?
                    <View style={tw`flex-row justify-around w-full bg-[${secondaryColor}] p-4 rounded-3xl shadow-xl`}>
                        <Link to={'scanner'} underlayColor="transparent">
                            <FontAwesome name="qrcode" size={32} color={tertiaryColor} />
                        </Link>
                        <Link to={'settings'} underlayColor="transparent">
                            <Ionicons name="settings" size={32} color={tertiaryColor} />
                        </Link>
                    </View>
                    : null}
            </View> */}
        </Container>
    );
};