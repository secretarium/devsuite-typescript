import { FC } from 'react';
import { Link } from 'react-router-native';
import { View, StyleSheet, Text } from 'react-native';
import { ScannerCombo } from '../components/ScannerCombo';

export const Scanner: FC = () => {

    return (
        <>
            <View style={styles.section}>
                <Text style={styles.textLg}>👀</Text>
            </View>
            <View style={styles.section}>
                <View style={styles.hero}>
                    <View style={styles.heroTitle}>
                        <Link to='/'>
                            <Text
                                style={[
                                    styles.textLg,
                                    styles.heroTitleText
                                ]}
                            >
                                Back
                            </Text>
                        </Link>
                    </View>
                </View>
            </View>
            <View style={styles.section}>
                <ScannerCombo />
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

export default Scanner;