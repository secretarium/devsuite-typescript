import { Text, View } from 'react-native';
import tw from 'twrnc';
export const App = () => {

    return <View style={tw`flex justify-center h-full p-4 android:pt-2 bg-white dark:bg-black`}>
        <Text style={tw`text-xl`}>Welcome to Susi 👋 !</Text>
        <Text>Open up App.tsx to start working on your app</Text>
    </View>;
};

export default App;
