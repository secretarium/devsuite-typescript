import { FC } from 'react';
import { Link } from 'react-router-native';
import { View, StyleSheet, Text } from 'react-native';

export const Index: FC = () => {

    return (
        <>
            <View style={styles.section}>
                <Text style={styles.textLg}>Hi there,</Text>
                <Text
                    style={[styles.textXL, styles.appTitleText]}
                    testID="heading"
                >
                    Welcome to Pocket👋
                </Text>
            </View>
            <View style={styles.section}>
                <View style={styles.hero}>
                    <View style={styles.heroTitle}>
                        <Link to='/scan'>
                            <Text
                                style={[
                                    styles.textLg,
                                    styles.heroTitleText
                                ]}
                            >
                                Scan to login
                            </Text>
                        </Link>
                    </View>
                </View>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    textLg: {
        fontSize: 24
    },
    textXL: {
        fontSize: 48
    },
    section: {
        marginVertical: 24,
        marginHorizontal: 12
    },
    appTitleText: {
        paddingTop: 12,
        fontWeight: '500'
    },
    hero: {
        borderRadius: 12,
        backgroundColor: '#143055',
        padding: 36,
        marginBottom: 24
    },
    heroTitle: {
        flex: 1,
        flexDirection: 'row'
    },
    heroTitleText: {
        color: '#ffffff',
        marginLeft: 12
    }
});

export default Index;