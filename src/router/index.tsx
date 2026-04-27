import { createBrowserRouter, Navigate } from 'react-router-dom';
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
import { PatientList, PatientDetail, PATIENT_BASE_PATH, PATIENT_DETAIL_PATH } from '@/modules/patient';
import { RootLayout } from '@/components/layout/RootLayout';

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
      { path: '/dashboard', element: <Navigate to={PATIENT_BASE_PATH} replace /> },
      { path: PATIENT_BASE_PATH, element: <PatientList /> },
      { path: PATIENT_DETAIL_PATH, element: <PatientDetail /> },
    ],
  },
]);
