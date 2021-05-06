import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Text, View, FlatList, Alert } from 'react-native';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Header } from '../components/Header';
import { PlantCardSecondary } from '../components/PlantCardSecondary';
import { Loading } from '../components/Loading';

import colors from '../styles/colors';
import waterdrop from '../assets/waterdrop.png';
import { PlantProps, loadPlant, removePlant } from '../libs/storage';
import fonts from '../styles/fonts';

export function MyPlants() {
    const [myPlants, setMyPlants] = useState<PlantProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [nextWatered, setNxtWatered] = useState<string>();

    useEffect(() => {
        async function loadStorageData() {
            const plantsStoraged = await loadPlant();

            if (plantsStoraged.length > 0) {
                const nextTime = formatDistance(
                    new Date(plantsStoraged[0].dateTimeNotification).getTime(),
                    new Date().getTime(),
                    { locale: ptBR }
                );
    
                setNxtWatered(
                    `Não esqueça de regar a ${plantsStoraged[0].name} às ${nextTime}`
                )    
            }

            setMyPlants(plantsStoraged);
            setLoading(false);
        }

        loadStorageData();
    }, []);

    // excluir planta
    function handleRemove(plant: PlantProps) {
        Alert.alert('Remover', `Deseja remover a ${plant.name}?`, [
            {
                text: 'Não',
                style: 'cancel'
            },
            {
                text: 'Sim',
                onPress: async () => {
                    try {
                        await removePlant(plant.id);
                        setMyPlants((oldData) => 
                            oldData.filter((item) => item.id != plant.id)
                        );
                    } catch(error) {
                        Alert.alert("Não foi possível remover!");
                    }
                }
            }
        ])
    }
    
    if (loading)
        return <Loading />
    return (
        <View style={styles.container}>
            <Header />

            {myPlants.length > 0 ? (
                <>
                    <View style={styles.spotlight}>
                        <Image
                            source={waterdrop}
                            style={styles.spotlightImage}
                        />

                        <Text style={styles.spotlightText}>
                            {nextWatered} 
                        </Text>
                    </View>

                    <View style={styles.plants}>
                        <Text style={styles.plantsTitle}>
                            Próximas regadas
                        </Text>

                        <FlatList
                            data={myPlants}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <PlantCardSecondary 
                                    data={item} 
                                    handleRemove={() => {handleRemove(item)}}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ flex: 1 }}
                        />
                    </View>

                </>
            ) : (
                <Text style={styles.emptyText}>Não há plantas cadastradas 😢</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingTop: 50,
        backgroundColor: colors.background
    },
    spotlight: {
        backgroundColor: colors.blue_light,
        paddingHorizontal: 20,
        borderRadius: 20,
        height: 110,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    spotlightImage: {
        width: 60,
        height: 60
    },
    spotlightText: {
        flex: 1,
        color: colors.blue,
        paddingHorizontal: 20
    },
    plants: {
        flex: 1,
        width: '100%'
    },
    plantsTitle: {
        fontSize: 24,
        fontFamily: fonts.heading,
        color: colors.heading,
        marginVertical: 20
    },
    emptyText: {
        marginBottom: 160,
        textAlign: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 20,
        backgroundColor: colors.shape
    }
});