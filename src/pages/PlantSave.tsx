import React, { useState } from 'react';
import { StyleSheet, Image, Text, View, Alert, Platform } from 'react-native';
import { SvgFromUri } from 'react-native-svg';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { useRoute, useNavigation } from '@react-navigation/core'
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import { isBefore, format } from 'date-fns';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { Button } from '../components/Button';

import waterdrop from '../assets/waterdrop.png';
import colors from '../styles/colors';
import fonts from '../styles/fonts';
import { PlantProps, savePlant } from '../libs/storage';

interface Params {
    plant: PlantProps
}

export function PlantSave() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(Platform.OS == "ios");

    const { plant } = route.params as Params;

    // change do time picker
    function handleChangeTime(event: Event, dateTime: Date | undefined) {
        if (Platform.OS == "android") {
            setShowDatePicker(oldState => !oldState);
        }

        if (dateTime && isBefore(dateTime, new Date())) {
            setSelectedDateTime(new Date());
            return Alert.alert("Escolha um horário no futuro! ⏰");
        }

        if (dateTime) {
            setSelectedDateTime(dateTime);
        }
    }

    function handleOpenDateTimePickerForAndroid() {
        setShowDatePicker(oldState => !oldState);
    }

    // salva cadastro da planta
    async function handleSavePlant() {
        try {
            await savePlant({
                ...plant,
                dateTimeNotification: selectedDateTime
            });

            // redireciona para tela de confirmacao. Obs.: Esta pagina é reutilizada em outros lugares
            navigation.navigate("Confirmation", {
                title: 'Tudo certo!',
                subtitle: 'Fique tranquilo que sempre vamos te lembrar de cuidar de sua plantinha',
                buttonTitle: 'Muito obrigado!',
                icon: 'hug',
                nextScreen: 'MyPlants'
            });    
            
        } catch(e) {
            Alert.alert("Falha ao cadastrar planta. Tente novamente. 😢");
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.plantInfo}>
                <SvgFromUri
                    uri={plant.photo}
                    width={150}
                    height={150}
                />

                <Text style={styles.plantName}>
                    { plant.name }
                </Text>

                <Text style={styles.plantAbout}>
                    { plant.about }
                </Text>
            </View>

            <View style={styles.controller}>

                <View style={styles.tipContainter}>
                    <Image
                        source={waterdrop}
                        style={styles.tipImage}
                    />

                    <Text style={styles.tipText}>
                        { plant.water_tips }
                    </Text>
                </View>

                <Text style={styles.alertLabel}>
                    Escolha o melhor horário para ser lembrado: 
                </Text>

                {showDatePicker && 
                    <DateTimePicker
                        value={selectedDateTime}
                        mode="time"
                        display="spinner"
                        onChange={handleChangeTime}
                    />
                }

                {
                    Platform.OS == "android" && (
                        <TouchableOpacity
                            style={styles.dateTimePickerButton}
                            onPress={handleOpenDateTimePickerForAndroid}
                        >
                            <Text style={styles.dateTimePickerText}>
                                {`${format(selectedDateTime, 'HH:mm')} - Alterar`}
                            </Text>
                        </TouchableOpacity>
                    )
                }

                <Button 
                    title="Cadastrar planta"
                    onPress={handleSavePlant}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: colors.shape,
    },
    plantInfo: {
        flex: 1,
        paddingHorizontal: 30,
        paddingVertical: 50,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.shape,
    },
    plantName: {
        fontFamily: fonts.heading,
        fontSize: 23,
        color: colors.heading,
        marginTop: 15
    },
    plantAbout: {
        textAlign: 'center',
        fontFamily: fonts.text,
        fontSize: 17,
        marginTop: 10
    },
    controller: {
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: getBottomSpace() || 20,
    },
    tipContainter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.blue_light,
        padding: 20,
        borderRadius: 20,
        position: 'relative',
        bottom: 60
    },
    tipImage: {
        width: 56,
        height: 56,
    },
    tipText: {
        flex: 1,
        marginLeft: 20,
        fontFamily: fonts.text,
        color: colors.blue,
        fontSize: 17,
        textAlign: 'justify'
    },
    alertLabel: {
        textAlign: 'center',
        fontFamily: fonts.complement,
        color: colors.heading,
        fontSize: 12,
        marginBottom: 5
    },
    dateTimePickerButton: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 40
    },
    dateTimePickerText: {
        color: colors.heading,
        fontSize: 24,
        fontFamily: fonts.text
    }
});