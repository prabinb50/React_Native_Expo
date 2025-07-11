import { Alert, Image, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import logo from "../../assets/images/dinetimelogo.png";
import emptyImg from "../../assets/images/Frame.png";
import { Formik } from "formik";
import validationSchema from "../../utils/authSchema";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";

const SignUp = () => {
    const router = useRouter(); // hook to navigate between routes

    // function to handle user sign-up process
    const handleSignUp = async (values) => {
        try {
            // create a new user account with Firebase Authentication
            const userCredentials = await createUserWithEmailAndPassword(auth, values.email, values.password);

            // extract the user object from the response which contains the newly created user's information
            const user = userCredentials.user;

            // store user information in firestore database
            await setDoc(doc(db, "users", user.uid), {
                email: values.email,
                createdAt: new Date(),
            });

            // store user email in AsyncStorage 
            await AsyncStorage.setItem("userEmail", values.email);

            // store a flag in AsyncStorage to indicate that the user is not a guest
            await AsyncStorage.setItem("isGuest", "false");

            // navigate to the home page after successful sign-up
            router.push("/signin");

        } catch (error) {
            console.log("Error while signing up:", error);

            // case 1: alert for email already in use and unexpected or network error
            if (error.code === "auth/email-already-in-use") {
                Alert.alert("Signup Failed!",
                    "This email is already in use. Please try a different email.",
                    [{ text: "OK" }]
                );
            } else {
                Alert.alert("Signup Error!",
                    "An unexpected error occurred. Please try again later.",
                    [{ text: "OK" }]
                );
            }
        }
    };

    // function to handle guest user login
    const handleGuestUser = async () => {
        // store a flag in AsyncStorage to indicate that the user is a guest
        await AsyncStorage.setItem("isGuest", "true");

        // navigate to the home page as a guest user
        router.push("/home");
    }

    return (
        <SafeAreaView className="bg-[#2b2b2b]">
            <StatusBar barStyle={"light-content"} />

            {/* make the screen scrollable */}
            <ScrollView contentContainerStyle={{ height: "100%" }}>
                {/* center content on the screen */}
                <View className="m-2 flex justify-center items-center">
                    <Image
                        source={logo}
                        style={{ width: 200, height: 100 }} // App logo
                    />

                    <Text className="text-lg text-center text-white font-bold mb-5">Let's get you started</Text>

                    <View className="w-5/6">
                        {/* formik - used for form handling and validation */}
                        <Formik
                            initialValues={{ email: "", password: "" }}
                            validationSchema={validationSchema}
                            onSubmit={handleSignUp}>
                            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                                <View className="w-full">
                                    {/* email Field */}
                                    <Text className="text-[#f49b33] mt-4 mb-2">Email</Text>
                                    <TextInput
                                        className="h-11 border border-white rounded px-2 text-white"
                                        keyboardType="email-address"
                                        onChangeText={handleChange("email")}
                                        value={values.email}
                                        onBlur={handleBlur("email")}
                                    />

                                    {/* email Error Message */}
                                    {errors.email && touched.email && (<Text className="text-red-500 text-xs mb-2">{errors.email}</Text>)}

                                    {/* password field */}
                                    <Text className="text-[#f49b33] mt-4 mb-2">Password</Text>
                                    <TextInput
                                        className="h-11 border border-white rounded px-2 text-white"
                                        secureTextEntry
                                        onChangeText={handleChange("password")}
                                        value={values.password}
                                        onBlur={handleBlur("password")}
                                    />

                                    {/* password error message */}
                                    {errors.password && touched.password && (<Text className="text-red-500 text-xs mb-2">{errors.password}</Text>)}

                                    {/* sign up button */}
                                    <TouchableOpacity
                                        className="p-2 bg-[#f49b33] text-black rounded-lg mt-6"
                                        onPress={handleSubmit}>
                                        <Text className="text-lg font-semibold text-center">Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Formik>

                        <View className="flex justify-center items-center">
                            {/* navigate to sign in */}
                            <TouchableOpacity onPress={() => router.push("/signin")} className="flex flex-row justify-center items-center mt-5 p-2">
                                <Text className="text-white font-semibold">Already a User? {" "}</Text>
                                <Text className="text-base font-semibold underline text-[#f49b33]">Sign In</Text>
                            </TouchableOpacity>

                            {/* separator */}
                            <Text className="text-center text-base font-semibold  text-white">
                                <View className="border-b-2 border-[#f49b33] p-2 mb-1 w-24" />
                                or{""}
                                <View className="border-b-2 border-[#f49b33] p-2 mb-1 w-24" />
                            </Text>

                            {/* continue as guest */}
                            <TouchableOpacity onPress={handleGuestUser} className="flex flex-row justify-center items-center mt-2 p-2">
                                <Text className="text-white font-semibold">Be a {" "}</Text>
                                <Text className="text-base font-semibold underline text-[#f49b33]">Guest User</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* bottom image */}
                <View className="flex-1">
                    <Image
                        source={emptyImg}
                        className="w-full h-full"
                        resizeMode="contain"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp
