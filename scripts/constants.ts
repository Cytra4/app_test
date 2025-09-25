import { Dimensions } from "react-native";

const {width: deviceWidth, height: deviceHeight} = Dimensions.get("window")

//Height percentages
export const hp = (percent: number) => {
    return (percent * deviceHeight) / 100;
}

//Width percentages
export const wp = (percent: number) => {
    return (percent * deviceWidth) / 100;
}