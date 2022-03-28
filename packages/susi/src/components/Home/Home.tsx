import React from 'react';
import { Entypo, FontAwesome5 } from '@expo/vector-icons';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Link } from '../../router/Router.native';
import Navigation from '../Navigation';
import tw from 'twrnc';

const DATA = [
    {
        id: '123',
        title: 'baam',
        app: 'SoftMetal',
        email: 'damian@secretarium.org'
    },
    {
        id: '231',
        title: 'boom',
        app: 'SFX',
        email: 'damian@secretarium.org'
    },
    {
        id: '321',
        title: 'biim',
        app: 'Moai',
        email: 'damian@secretarium.org'
    }
];

const Home: React.FC = () => {
    return (
        <Navigation>
            <View style={tw`flex justify-center content-center p-4 h-full`}>
                <FlatList
                    data={DATA}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={tw`rounded-md overflow-hidden flex-row items-center bg-[#E1E8ED] my-1 w-full`}>
                            <Link to={`/keys/${item.id}`} style={tw``} underlayColor="transparent">
                                <View style={tw`px-2 py-4 flex-1 flex-row justify-between flex-wrap`}>
                                    <View style={tw`flex-row p-2`}>
                                        <FontAwesome5 name="key" size={24} color="#404040" style={tw`pr-6`} />
                                        <View>
                                            <Text>{item.app}</Text>
                                            <Text>{item.email}</Text>
                                        </View>
                                    </View>
                                    <Entypo
                                        name="chevron-right"
                                        style={tw`self-center`}
                                        color="#404040"
                                        size={24} />
                                </View>
                            </Link>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </Navigation>
    );
};

export default Home;