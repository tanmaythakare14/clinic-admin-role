import { createBrowserRouter, Navigate } from 'react-router-dom';
import {
  SignIn,
  EmailVerification,
  SetPassword,
  CreateProfile,
  SIGN_IN_PATH,
  EMAIL_VERIFICATION_PATH,
  SET_PASSWORD_PATH,
  CREATE_PROFILE_PATH,
} from '@/modules/onboarding';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={SIGN_IN_PATH} replace />,
  },
  {
    path: SIGN_IN_PATH,
    element: <SignIn />,
  },
  {
    path: EMAIL_VERIFICATION_PATH,
    element: <EmailVerification />,
  },
  {
    path: SET_PASSWORD_PATH,
    element: <SetPassword />,
  },
  {
    path: CREATE_PROFILE_PATH,
    element: <CreateProfile />,
  },
  // Future routes will be added here as modules are built:
  // { path: SET_PASSWORD_PATH,   element: <SetPassword /> },
  // { path: REVIEW_CLINIC_PATH,  element: <ReviewClinic /> },
  // { path: CREATE_PROFILE_PATH, element: <CreateProfile /> },
  // { path: REVIEW_USERS_PATH,   element: <ReviewUsers /> },
  // { path: REVIEW_EHR_PATH,     element: <ReviewEhr /> },
  // { path: DASHBOARD_PATH,      element: <Dashboard /> },
]);
