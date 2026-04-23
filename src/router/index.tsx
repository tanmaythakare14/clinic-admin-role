import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import {
  SignIn,
  EmailVerification,
  SetPassword,
  CreateProfile,
  ReviewUsers,
  ReviewEHR,
  SIGN_IN_PATH,
  EMAIL_VERIFICATION_PATH,
  SET_PASSWORD_PATH,
  CREATE_PROFILE_PATH,
  REVIEW_USERS_PATH,
  REVIEW_EHR_PATH,
} from '@/modules/onboarding';
import { DemoGuide } from '@/components/demo-guide/DemoGuide';

function RootLayout(): React.JSX.Element {
  return (
    <>
      <Outlet />
      <DemoGuide />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Navigate to={SIGN_IN_PATH} replace /> },
      { path: SIGN_IN_PATH, element: <SignIn /> },
      { path: EMAIL_VERIFICATION_PATH, element: <EmailVerification /> },
      { path: SET_PASSWORD_PATH, element: <SetPassword /> },
      { path: CREATE_PROFILE_PATH, element: <CreateProfile /> },
      { path: REVIEW_USERS_PATH, element: <ReviewUsers /> },
      { path: REVIEW_EHR_PATH, element: <ReviewEHR /> },
    ],
  },
]);
