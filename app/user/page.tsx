"use client";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoginButton from "../../components/LoginButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface DecodedToken {
  user_id: number;
  eth_address: string;
  edu_username: string;
  iss: string;
  iat: number;
  exp: number;
  aud: string;
  [key: string]: any;
}

const UserPage = () => {
  const { authState } = useOCAuth();
  const router = useRouter();

  if (authState.error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 p-4 rounded-md shadow-md">
          <p className="text-red-600">Error: {authState.error.message}</p>
        </div>
      </div>
    );
  } else {
    let userInfo: DecodedToken | null = null;

    if (authState.idToken) {
      userInfo = jwtDecode<DecodedToken>(authState.idToken);
    }

    return (
      <div className="App min-h-screen flex flex-col items-center justify-between">
        <Header />
        <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
          <Card className=" w-full max-w-2xl p-8 shadow-lg">
            <CardHeader>
              {userInfo ? (
                <>
                  <CardTitle className="text-center text-4xl font-bold mt-2">
                    Welcome to Open Campus ID
                  </CardTitle>
                  <p className="mb-6 text-gray-600 text-center font-bold text-xl">
                    Here are your OCID details:
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold mb-4">
                    Connect with OCID
                  </CardTitle>
                  <p className="mb-6 text-gray-600">
                    Please link with open campus to view your details.
                  </p>
                  <LoginButton />
                </div>
              )}
            </CardHeader>
            {userInfo && (
              <CardContent>
                <div>
                  <p>
                    <strong>User ID:</strong> {userInfo.user_id}
                  </p>
                  <p>
                    <strong>Ethereum Address:</strong> {userInfo.eth_address}
                  </p>
                  <p>
                    <strong>Username:</strong> {userInfo.edu_username}
                  </p>
                  <p>
                    <strong>Issuer:</strong> {userInfo.iss}
                  </p>
                  <p>
                    <strong>Issued At:</strong>{" "}
                    {new Date(userInfo.iat * 1000).toLocaleString()}
                  </p>
                  <p>
                    <strong>Expiration:</strong>{" "}
                    {new Date(userInfo.exp * 1000).toLocaleString()}
                  </p>
                  <p>
                    <strong>Audience:</strong> {userInfo.aud}
                  </p>
                </div>
              </CardContent>
            )}
            <CardFooter className="flex justify-center">
              <Button
                onClick={() => router.push("/")}
                className="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
              >
                Go to Home
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
};

export default UserPage;
