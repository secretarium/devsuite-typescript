import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-native';
import { View, StyleSheet, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const generateUniqSerial = () => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

async function createUniqueIdKey() {
    const result = await SecureStore.getItemAsync('v0.alpha.uniqueId');
    if (!result) {
        await SecureStore.setItemAsync('v0.alpha.uniqueId', generateUniqSerial(), {
            authenticationPrompt: 'Please unlock Pocket'
        });
        return null;
    }
    return result;
}

export const Index: FC = () => {

    const [hasLoadedId, setHasLoadedId] = useState(false);
    const [uniqueId, setUniqueId] = useState<string | null>(null);

    useEffect(() => {
        if (hasLoadedId)
            return;
        setHasLoadedId(true);
        (async () => {
            const uId = await createUniqueIdKey();
            setUniqueId(uId);
        })();
    }, []);

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
                <View style={[styles.hero].concat(!uniqueId ? [styles.heroDisabled] : [] as any)}>
                    <View style={styles.heroTitle}>
                        <Link to='/scan' disabled={!uniqueId}>
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
            <View style={styles.section}>
                <Text>{uniqueId}</Text>
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
    heroDisabled: {
        backgroundColor: '#CCCCCC'
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