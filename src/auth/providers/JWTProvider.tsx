/* eslint-disable no-unused-vars */
import axios, { AxiosResponse } from 'axios';
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useEffect,
  useState
} from 'react';

import * as authHelper from '../_helpers';
import { type AuthModel, type UserModel } from '@/auth';

const API_URL = import.meta.env.VITE_APP_API_URL;
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const FORGOT_PASSWORD_URL = `${API_URL}/forgot-password`;
export const RESET_PASSWORD_URL = `${API_URL}/reset-password`;
export const GET_USER_URL = `${API_URL}/user`;

interface AuthContextProps {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  register: (email: string, password: string, password_confirmation: string) => Promise<void>;
  requestPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => Promise<void>;
  getUser: () => Promise<AxiosResponse<any>>;
  logout: () => void;
  verify: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  const verify = async () => {
    if (auth) {
      try {
        const { data: user } = await getUser();
        setCurrentUser(user);
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  };

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication response
      const auth: AuthModel = {
        access_token: 'mock-access-token-' + Date.now(),
        api_token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      };
      
      saveAuth(auth);
      
      // Mock user data
      const user: UserModel = {
        id: 1,
        username: email.split('@')[0],
        password: undefined,
        email: email,
        first_name: 'John',
        last_name: 'Doe',
        fullname: 'John Doe',
        pic: '/media/avatars/300-1.png'
      };
      
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const register = async (email: string, password: string, password_confirmation: string) => {
    try {
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock authentication response
      const auth: AuthModel = {
        access_token: 'mock-access-token-' + Date.now(),
        api_token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
      };
      
      saveAuth(auth);
      
      // Mock user data
      const user: UserModel = {
        id: 1,
        username: email.split('@')[0],
        password: undefined,
        email: email,
        first_name: 'Jane',
        last_name: 'Smith',
        fullname: 'Jane Smith',
        pic: '/media/avatars/300-2.png'
      };
      
      setCurrentUser(user);
    } catch (error) {
      saveAuth(undefined);
      throw new Error(`Error ${error}`);
    }
  };

  const requestPasswordResetLink = async (email: string) => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success - in real implementation, this would send an email
    console.log(`Password reset link sent to: ${email}`);
  };

  const changePassword = async (
    email: string,
    token: string,
    password: string,
    password_confirmation: string
  ) => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock success - in real implementation, this would update the password
    console.log(`Password changed for: ${email}`);
  };

  const getUser = async () => {
    // Mock API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user response
    const mockUser: UserModel = {
      id: 1,
      username: 'johndoe',
      password: undefined,
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      fullname: 'John Doe',
      pic: '/media/avatars/300-1.png'
    };
    
    // Return in axios response format
    return {
      data: mockUser,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any
    } as AxiosResponse<UserModel>;
  };

  const logout = () => {
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        currentUser,
        setCurrentUser,
        login,
        register,
        requestPasswordResetLink,
        changePassword,
        getUser,
        logout,
        verify
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
