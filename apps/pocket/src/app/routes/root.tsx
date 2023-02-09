import { FC, useRef } from 'react';
import { Outlet } from 'react-router-native';
import { SafeAreaView, StyleSheet, ScrollView, StatusBar } from 'react-native';

export const Root: FC = () => {

    const scrollViewRef = useRef<null | ScrollView>(null);

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView>
                <ScrollView
                    ref={(ref) => {
                        scrollViewRef.current = ref;
                    }}
                    contentInsetAdjustmentBehavior="automatic"
                    style={styles.scrollView}
                >
                    <Outlet />
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        backgroundColor: '#ffffff',
        padding: 12
    }
});

export default Root;