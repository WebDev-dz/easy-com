import { Platform } from "react-native";
import Toast from "react-native-toast-message";

export const toastAlert = {
    success: (message: string) => {
        if (Platform.OS === "web") {
            alert(message);
            return;
        }
        Toast.show({
            type: 'success',
            text1: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    },

    error: (message: string) => {
        if (Platform.OS === "web") {
            alert(message);
            return;
        }
        Toast.show({
            type: 'error',
            text1: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    },

    info: (message: string) => {
        if (Platform.OS === "web") {
            alert(message);
            return;
        }
        Toast.show({
            type: 'info',
            text1: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    },

    warning: (message: string) => {
        if (Platform.OS === "web") {
            alert(message);
            return;
        }
        Toast.show({
            type: 'warning',
            text1: message,
            position: 'bottom',
            visibilityTime: 3000,
        });
    }
};
