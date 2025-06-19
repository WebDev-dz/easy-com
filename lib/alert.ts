import { Alert, AlertButton, Platform } from "react-native";





export const alertService = (title: string, message: string, buttons?: AlertButton[]) => {
    if (Platform.OS === "web") {
        alert(message);
        return;
    }
    Alert.alert(title, message, buttons);
};

export const confirmService = (title: string, message: string, buttons?: AlertButton[]) => {
    if (Platform.OS === "web") {
        alert(message);
        return;
    }
    Alert.alert(title, message, buttons);
};

export const promptService = (title: string, message: string, buttons?: AlertButton[]) => {
    if (Platform.OS === "web") {
        alert(message);
        return;
    }
    Alert.alert(title, message, buttons);
};